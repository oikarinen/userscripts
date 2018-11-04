// ==UserScript==
// @name        Oikotie google maps
// @namespace   http://tampermonkey.net/
// @description Google maps directions & travel time to apartments sold in oikotie
// @include     https://asunnot.oikotie.fi/myytavat-asunnot*
// @version     0.1
// @grant       GM_getValue
// @grant       GM_setValue
// @license     All rights reserved.
// ==/UserScript==

const google = unsafeWindow.google

// first part: add elements for start/end points, store them in GM,
window.addEventListener('load', function() {
    insertContent();
    initMap();
    // calculate route alread now if we have something for target
    if (document.getElementById('start').value && document.getElementById('start').value) {
        document.getElementById('start').dispatchEvent(new Event('change'));
    }

    console.log("loaded oikotie script");
}, false);

function insertContent() {
    const routeFloat = document.createElement('div');
    routeFloat.style = "position: absolute; top: 10px; left: 25%; width: 300px; height: 36px; z-index: 5; background-color: #fff; padding: 5px; border: 1px solid #999; text-align: center; line-height: 30px; padding-left: 10px;";
    const routeEnd = document.createElement('input');
    routeEnd.type = "text";
    routeEnd.placeholder = "Destination";
    routeEnd.value = GM_getValue("end") || "";
    routeEnd.id = "end";
    routeEnd.style = "position: relative; float: left; width: 150px; height: 24px; font-size: 8pt;";
    routeFloat.appendChild(routeEnd);

    const routeStart = document.createElement('input');
    // read destination address from the page
    var temp = document.querySelectorAll(".listing-breadcrumbs__item");
    routeStart.type = "hidden";
    routeStart.value = temp[temp.length-1].textContent.trim();
    routeStart.id = "start";
    routeFloat.appendChild(routeStart);

    const routeMode = document.createElement('select');
    routeMode.id = "mode";
    routeMode.style = "position: relative; float: right; width: 100px; height: 24px; padding-top: 0; padding-bottom: 0; font-size: 8pt;";
    const transitModes = ['Transit', 'Driving', 'Walking'];
    for (var i = 0, len = transitModes.length; i < len; i++) {
        var opt = document.createElement('option');
        opt.value = transitModes[i].toUpperCase();
        opt.text = transitModes[i];
        routeMode.appendChild(opt);
    }
    routeFloat.appendChild(routeMode);

    // map added to correct place
    var tabsdiv = document.getElementsByClassName('tabs-content')[0];
    const routetabdiv = document.createElement('div');
    routetabdiv.id="route-tab";
    routetabdiv.className = "content";
    routetabdiv.style.position = "relative"; // padding margin
    tabsdiv.insertBefore(routetabdiv, tabsdiv.lastElementChild);
    const routemapdiv = document.createElement('map'); //misuse image maps just like oikotie
    //routemapdiv.className = "ng-isolate-scope";
    routetabdiv.appendChild(routemapdiv);
    const mapdiv = document.createElement('div');
    mapdiv.id = 'mapdiv';
    mapdiv.className = "map";
    mapdiv.style.position = "absolute";
    mapdiv.style.top = "0";
    mapdiv.style.left = "0";
    mapdiv.style.height = "100%";
    mapdiv.style.width = "70%";
    mapdiv.style.float = "left";
    routemapdiv.appendChild(mapdiv);

    const dirpaneldiv = document.createElement('div');
    dirpaneldiv.id = "directionsPanel";
    dirpaneldiv.style.position = "relative";
    dirpaneldiv.style.float = "right";
    dirpaneldiv.style.width = "30%";
    routemapdiv.appendChild(dirpaneldiv);

    // float for selecting dest + mode
    routemapdiv.appendChild(routeFloat);

    //nav link
    var gallerytabs = document.getElementById('gallery-tabs');
    const routegallery = document.createElement('li');
    routegallery.className = "gallery-controls__list-item";
    routegallery.innerHTML = '<a class="gallery-controls__link link gallery-controls__link link" onclick="return false;" href="#route-tab" aria-selected="true" tabindex="0"><i class="link__icon customer-color-link customer-color-link--icon"></i><span class="show-for-medium-up link__text customer-color-link customer-color-link--icon">Route</span></a>';
    gallerytabs.appendChild(routegallery);

    //style element to hide extra route info & display distance + time next to breadcrumps
    var styles = document.createElement('style');
    styles.type = 'text/css';
    var hideElements = [ "adp-warnbox", "adp-placemark", "adp-details", "adp-directions", "adp-agencies", "adp-legal" ];
    var css = "";
    for (var j = 0; j < hideElements.length; j++) {
        css += '.' + hideElements[j] + '{ display: none }\n';
    }
    styles.appendChild(document.createTextNode(css));

    (document.head || document.getElementsByTagName('head')[0] || document.querySelector('body')).appendChild(styles);

}


function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var hel = new google.maps.LatLng(60.21, 25.08);
    var mapOptions = {
        //zoom: 7,
        //center: hel,
        gestureHandling: 'greedy',
        streetViewControl: false

    }
    var map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));

    // public transport layer
    var transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    // calculate route when start/end locations change
    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    // valus from the form
    var selectedMode = document.getElementById('mode').value;
    var origin = document.getElementById('start').value;
    var destination = document.getElementById('end').value;

    // side effect store end value in GM
    GM_setValue("end", document.getElementById('end').value);
    console.log("calculateAndDisplayRoute called");
    // date for next monday 9 am
    var monday = new Date();
    monday.setDate(monday.getDate() + (1 + 7 - monday.getDay()) % 7);
    monday.setHours(9,0,0);
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[selectedMode],
        transitOptions: {
            arrivalTime: monday
        },
        provideRouteAlternatives: true,
        region: 'fi'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}