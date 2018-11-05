
// ==UserScript==
// @name        Oikotie open data
// @namespace   http://tampermonkey.net/
// @description Average price for apartments sold in oikotie and more
// @include     https://asunnot.oikotie.fi/myytavat-asunnot*
// @version     0.1
// @license     All rights reserved.
// ==/UserScript==

window.addEventListener('load', function() {
    comparePriceAverage();
    compareCosts();
}, false);// highlight values in info rows

function infoField(fieldName) {
    var rows = document.getElementsByClassName('info-table__title');
    for (var i = 0, len = rows.length; i < len; i++) {
        var row = rows[i];
        if (row.innerText.search(fieldName) != -1) {
            var node = row.parentElement.lastElementChild;
            return node; // we just return first occurance
        }
    }
}

/*
// this data came from https://www.avoindata.fi/data/fi/dataset/helsingin-vanhojen-asunto-osakehuoneistojen-neliohinnat-postinumeroalueittain-vuodesta-2000
#!/usr/bin/perl
use JSON;
my %i;
while (<>) {
    chomp;
    my @r = split ',';
    $i{$r[0]} = $r[16] if ($r[0] =~ /^\d\d\d\d\d$/);
}
print encode_json \%i;
*/
var avgprices = JSON.parse('{"00230":"-","00850":"4279","00550":"4361","00520":"4355","00500":"5098","00820":"2911","00630":"3245","00990":"4205","00310":"3568","00860":"-","00610":"4649","00960":"2754","00690":"3129","00190":"-","00390":"3096","00580":"3988","00770":"2134","00680":"3178","00900":"3000","00510":"4904","00220":"-","00430":"3138","00140":"6799","00440":"3584","00590":"-","00270":"5322","00120":"5997","00340":"3723","00790":"3779","00400":"3703","00650":"3441","00930":"3241","00170":"6123","00910":"3207","00940":"2305","00980":"2940","00970":"2536","00160":"5731","00730":"3284","00540":"-","00600":"3279","00320":"4341","00640":"3225","00950":"3345","00250":"5423","00800":"4044","00330":"4914","00210":"5102","00810":"4057","00570":"4268","00380":"-","00200":"4899","00360":"3373","00560":"4632","00530":"5039","00240":"4456","00130":"7153","00100":"5979","00300":"4278","00760":"2830","00370":"3168","00420":"3006","00280":"4799","00720":"3101","00700":"3144","00740":"2743","00780":"3047","00150":"6575","00710":"2583","00290":"..","00880":"-","00410":"2634","00830":"3443","00840":"3219","00180":"5751","00750":"2655","00920":"2672","00620":"3314","00660":"2823","00870":"3044","00350":"4082","00260":"5896"}');
function comparePriceAverage() {
    var pps = infoField("Neliöhinta")
    var ppsvalue = parseFloat(pps.innerText.replace(/m2/,"").replace(/[^0-9,]/g,"").replace(/,/,"."));
    var postalcode = /\d\d\d\d\d/.exec(infoField("Sijainti").innerText)[0];
    var avg = avgprices[postalcode];
    pps.innerHTML += " (avg 2016 was " + avg + " e/m<sup>2</sup> for " + postalcode + ")";
    // paint it red if price more than 2016 avg for the zip +10%
    if (ppsvalue > avg * 1.1) {
        pps.style = "color: red;";
        pps.innerHTML += " price >110%";
    } else if (ppsvalue < avg * 0.8) {
        pps.style = "color: red;";
        pps.innerHTML += " price <80%";
    }
}

function compareCosts() {
    var m2 = infoField("Asuinpinta-ala");
    var hv = infoField("Hoitovastike");
    var rv = infoField("Rahoitusvastike");
    var by = infoField("Rakennusvuosi");
    var m2val = parseFloat(m2.innerText.replace(/m2/,"").replace(/,/,"."));
    var hvval = parseFloat(hv.replace(/,/,"."))/m2val;
    var rvval = parseFloat(rv.replace(/,/,"."))/m2val;
    var age = (new Date()).getFullYear() - parseInt(by);
    // el not used yet
    var el = infoField("Sähkökustannukset");
    var lo = infoField("Tontin omistus");

    if (hvval > 3.0) {
        hv.style = "color: red;";
        hv.innerHTML += " high hv/m<sup>2</sup> " + hvval;
    }
    if (rvval > 1.0) {
        rv.style = "color: red;";
        rv.innerHTML += " high rv/m<sup>2</sup> " + hvval;
    }
    if (age > 40) {
        by.style = "color: red;";
        by.innerHTML += " old building, check repairs";
    }
    if (lo.innerText.search(/oma/i) == -1 || lo.innerText.search(/vuokra/i != -1)) {
        lo.style = "color: red;";
    }
}
