// ==UserScript==
// @name        Oikotie google maps
// @namespace   http://tampermonkey.net/
// @description Google maps directions & travel time to apartments sold in oikotie
// @include     https://asunnot.oikotie.fi/myytavat-asunnot/*
// @version     0.2.2
// @grant       GM_getValue
// @grant       GM_setValue
// @license     All rights reserved.
// ==/UserScript==

const google = unsafeWindow.google

// first part: add elements for start/end points, store them in GM,
window.addEventListener('load', function() {
    insertContent();
    initializeRoutePoints();
    initMap();
}, false);

function initializeRoutePoints() {
    var routeEnd = document.getElementById('end');
    var routeStart = document.getElementById('start');
    routeEnd.value = GM_getValue("end") || "";
    // read destination address from the page
    var addr = document.querySelectorAll(".listing-breadcrumbs__item");
    routeStart.value = addr[addr.length-1].textContent.trim();
}

function insertContent() {
    const routeFloat = document.createElement('div');
    routeFloat.style = "position: absolute; top: 10px; left: 25%; width: 300px; height: 36px; z-index: 5; background-color: #fff; padding: 5px; border: 1px solid #999; text-align: center; line-height: 30px; padding-left: 10px;";
    const routeEnd = document.createElement('input');
    routeEnd.type = "text";
    routeEnd.placeholder = "Destination";
    routeEnd.id = "end";
    routeEnd.style = "position: relative; float: left; width: 150px; height: 24px; font-size: 8pt;";
    routeFloat.appendChild(routeEnd);

    const routeStart = document.createElement('input');
    routeStart.type = "hidden";
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

    //style element to hide extra route info & display distance + time to heading
    var styles = document.createElement('style');
    styles.type = 'text/css';
    var hideElements = [ "adp-warnbox", "adp-placemark", "adp-details", "adp-directions", "adp-agencies", "adp-legal" ];
    var css = "";
    for (var j = 0; j < hideElements.length; j++) {
        css += '.' + hideElements[j] + '{ display: none }\n';
    }
    styles.appendChild(document.createTextNode(css));
    (document.head || document.getElementsByTagName('head')[0] || document.querySelector('body')).appendChild(styles);

    const routeSummary = document.createElement('span');
    routeSummary.className = "listing-header__text";
    routeSummary.id = "routeSummary";
    // h2 with span elements for address & room layout
    var header2ndline = document.getElementsByClassName('listing-header__headline listing-header__headline--secondary')[0];
    header2ndline.insertBefore(routeSummary, header2ndline.lastElementChild);
}

function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var hel = new google.maps.LatLng(25.0, 60.2);
    var mapOptions = {
        zoom: 12,
        center: hel,
        gestureHandling: 'greedy',
        streetViewControl: false
    }
    var map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));

    // public transport layer
    var transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    // WMS part adapted from https://jsfiddle.net/u8tbv3hg/
    // Set tile size to map size to get just one single tile. But still  multiple tiles is fetched from server
    var TILE_WIDTH = 256;
    var TILE_HEIGHT = 256;
    var wmsMapType = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            var proj = map.getProjection();
            var zfactor = Math.pow(2, zoom);
            // get Long Lat coordinates
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
            //create the Bounding box string
            var bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();
            //The data must be in WGS84
            var baseURL = 'https://kartta.hsy.fi/geoserver/wms?';
            var version = "1.3.0";
            var request = "GetMap";
            var format = "image/png"; //type of image returned
            //The layer ID.  Can be found when using the layers properties tool in ArcMap
            var layers = 'Kavely5min,Kavely10min,Kavely15min'; // 10 15
            //var srs = "EPSG:4326"; //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
            var srs = "CRS:84"; // looks like we know..

            //Add the components of the URL together
            var width = TILE_WIDTH;
            var height = TILE_HEIGHT;

            var styles = "Asemanseutu_5min,Asemanseutu_10min,Asemanseutu_15min"; // 10 15
            var url = baseURL + "version=" + version + "&request=" + request + "&Layers=" + layers + "&Styles=" + styles + "&CRS=" + srs + "&BBOX=" + bbox + "&width=" + width + "&height=" + height + "&format=" + format + "&TRANSPARENT=TRUE&EXCEPTIONS=INIMAGE";
            console.log(url);
            return url;
        },
        tileSize: new google.maps.Size(TILE_WIDTH, TILE_HEIGHT),
        isPng: true
    });

    map.overlayMapTypes.insertAt(0, wmsMapType);


    // calculate route when start/end locations change
    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
    document.getElementById('mode').addEventListener('change', onChangeHandler);
    // calculate route alread now if we have something for target
    if (document.getElementById('start').value && document.getElementById('end').value) {
        document.getElementById('start').dispatchEvent(new Event('change'));
    }

    calculateSummaryRoutes(directionsService, directionsDisplay);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    // values from the form
    var selectedMode = document.getElementById('mode').value;
    var origin = document.getElementById('start').value;
    var destination = document.getElementById('end').value;

    // side effect store end value in GM
    GM_setValue("end", document.getElementById('end').value);
    // date for next monday 9 am
    var monday = new Date();
    monday.setDate(monday.getDate() + (1 + 7 - monday.getDay()) % 7);
    monday.setHours(9,0,0);

    console.log("calculateAndDisplayRoute called for " + selectedMode + " from " + origin + " to " + destination + " at " + monday);

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
            var item = response.routes[0].legs[0];
            if (item) {
                var routeSummary = item.distance.text + " " + item.duration.text;
                //updateRouteSummary(routeSummary);
            }
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function calculateSummaryRoutes(directionsService, directionsDisplay) {
    var selectedModes = [ "Transit", "Driving" ];
    // values from the form
    var origin = document.getElementById('start').value;
    var destination = document.getElementById('end').value;

    // date for next monday 9 am
    var monday = new Date();
    monday.setDate(monday.getDate() + (1 + 7 - monday.getDay()) % 7);
    monday.setHours(9,0,0);

    let routeSummary = "";
    var selectedMode = "TRANSIT";
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[selectedMode],
        transitOptions: {
            arrivalTime: monday
        },
        region: 'fi'
    }, function(response, status) {
        if (status === 'OK') {
            var item = response.routes[0].legs[0];
            if (item) {
                routeSummary += "public: " + item.duration.text + " ";
            }
            //console.log(routeSummary);
            updateRouteSummary(routeSummary);
        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
    /*
    selectedMode = "DRIVING";
    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[selectedMode],
        transitOptions: {
            arrivalTime: monday
        },
        region: 'fi'
    }, function(response, status) {
        if (status === 'OK') {
            var item = response.routes[0].legs[0];
            var mode = response.request.travelMode;
            if (item) {
                routeSummary += "car: " + item.distance.text + " " + item.duration.text + " ";
            }
            console.log(routeSummary);
            updateRouteSummary(routeSummary);

        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
    */
}

// update summary
function updateRouteSummary(text) {
    var routeSummaryDiv = document.getElementById('routeSummary');
    if (!routeSummaryDiv) {
        console.log("still missing routeSummary");
        return;
    }
    routeSummaryDiv.innerText = text;
}
