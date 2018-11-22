
// ==UserScript==
// @name        Oikotie open data
// @namespace   http://tampermonkey.net/
// @description Average price for apartments sold in oikotie and more
// @include     https://asunnot.oikotie.fi/myytavat-asunnot/*
// @version     0.2.2
// @license     All rights reserved.
// ==/UserScript==

window.addEventListener('load', function() {
    comparePriceAverage();
    compareCosts();
}, false);// highlight values in info rows

/*
// this data came from https://www.avoindata.fi/data/fi/dataset/helsingin-vanhojen-asunto-osakehuoneistojen-neliohinnat-postinumeroalueittain-vuodesta-2000
use strict;
use JSON;
my @t = qw/kaikki kerros rivi/;
my %o;
while (<>) {
    chomp;
    my @r = split ',';
    if ($r[0] =~ /^\d\d\d\d\d$/) {
        for my $i (0..$#t) {
            $o{$r[0]}{$t[$i]} = $r[(1+$i)*16];
        }
    }
}
print encode_json \%o;
*/
//var avgprices = JSON.parse('{"00230":"-","00850":"4279","00550":"4361","00520":"4355","00500":"5098","00820":"2911","00630":"3245","00990":"4205","00310":"3568","00860":"-","00610":"4649","00960":"2754","00690":"3129","00190":"-","00390":"3096","00580":"3988","00770":"2134","00680":"3178","00900":"3000","00510":"4904","00220":"-","00430":"3138","00140":"6799","00440":"3584","00590":"-","00270":"5322","00120":"5997","00340":"3723","00790":"3779","00400":"3703","00650":"3441","00930":"3241","00170":"6123","00910":"3207","00940":"2305","00980":"2940","00970":"2536","00160":"5731","00730":"3284","00540":"-","00600":"3279","00320":"4341","00640":"3225","00950":"3345","00250":"5423","00800":"4044","00330":"4914","00210":"5102","00810":"4057","00570":"4268","00380":"-","00200":"4899","00360":"3373","00560":"4632","00530":"5039","00240":"4456","00130":"7153","00100":"5979","00300":"4278","00760":"2830","00370":"3168","00420":"3006","00280":"4799","00720":"3101","00700":"3144","00740":"2743","00780":"3047","00150":"6575","00710":"2583","00290":"..","00880":"-","00410":"2634","00830":"3443","00840":"3219","00180":"5751","00750":"2655","00920":"2672","00620":"3314","00660":"2823","00870":"3044","00350":"4082","00260":"5896"}');
const avgprices = JSON.parse('{"00230":{"kerros":"-","kaikki":"-","rivi":"-"},"00850":{"kerros":"..","kaikki":"4279","rivi":"3505"},"00550":{"kerros":"4133","kaikki":"4361","rivi":".."},"00520":{"kerros":"4265","kaikki":"4355","rivi":"-"},"00500":{"kerros":"4930","kaikki":"5098","rivi":"-"},"00820":{"kerros":"2832","kaikki":"2911","rivi":"-"},"00630":{"kerros":"2977","kaikki":"3245","rivi":"4050"},"00990":{"kerros":"4272","kaikki":"4205","rivi":"3669"},"00310":{"kerros":"3642","kaikki":"3568","rivi":"-"},"00860":{"kerros":"-","kaikki":"-","rivi":"-"},"00610":{"kerros":"4253","kaikki":"4649","rivi":".."},"00960":{"kerros":"2690","kaikki":"2754","rivi":"3068"},"00690":{"kerros":"3656","kaikki":"3129","rivi":"3081"},"00190":{"kerros":"-","kaikki":"-","rivi":".."},"00390":{"kerros":"3037","kaikki":"3096","rivi":"3079"},"00580":{"kerros":"3924","kaikki":"3988","rivi":"-"},"00770":{"kerros":"2083","kaikki":"2134","rivi":".."},"00680":{"kerros":"..","kaikki":"3178","rivi":"3395"},"00900":{"kerros":"2923","kaikki":"3000","rivi":".."},"00510":{"kerros":"4791","kaikki":"4904","rivi":"-"},"00220":{"kerros":"-","kaikki":"-","rivi":"-"},"00430":{"kerros":"..","kaikki":"3138","rivi":"3076"},"00140":{"kerros":"6656","kaikki":"6799","rivi":"-"},"00440":{"kerros":"3428","kaikki":"3584","rivi":".."},"00590":{"kerros":"-","kaikki":"-","rivi":".."},"00270":{"kerros":"5301","kaikki":"5322","rivi":"-"},"00120":{"kerros":"6135","kaikki":"5997","rivi":"-"},"00340":{"kerros":"3620","kaikki":"3723","rivi":"5157"},"00790":{"kerros":"3756","kaikki":"3779","rivi":"3492"},"00400":{"kerros":"3658","kaikki":"3703","rivi":".."},"00650":{"kerros":"3270","kaikki":"3441","rivi":"3591"},"00930":{"kerros":"2819","kaikki":"3241","rivi":"3417"},"00170":{"kerros":"6256","kaikki":"6123","rivi":"-"},"00910":{"kerros":"3118","kaikki":"3207","rivi":".."},"00940":{"kerros":"2321","kaikki":"2305","rivi":"2668"},"00980":{"kerros":"2881","kaikki":"2940","rivi":"3256"},"00970":{"kerros":"2463","kaikki":"2536","rivi":"2842"},"00160":{"kerros":"5968","kaikki":"5731","rivi":"-"},"00730":{"kerros":"3278","kaikki":"3284","rivi":"3094"},"00540":{"kerros":"-","kaikki":"-","rivi":"-"},"00600":{"kerros":"3210","kaikki":"3279","rivi":".."},"00320":{"kerros":"4215","kaikki":"4341","rivi":"3991"},"00640":{"kerros":"3118","kaikki":"3225","rivi":"3282"},"00950":{"kerros":"2824","kaikki":"3345","rivi":"3465"},"00250":{"kerros":"5500","kaikki":"5423","rivi":"-"},"00800":{"kerros":"3914","kaikki":"4044","rivi":"3477"},"00330":{"kerros":"4867","kaikki":"4914","rivi":".."},"00210":{"kerros":"5104","kaikki":"5102","rivi":".."},"00810":{"kerros":"3932","kaikki":"4057","rivi":"4428"},"00570":{"kerros":"4240","kaikki":"4268","rivi":"4922"},"00380":{"kerros":"4028","kaikki":"-","rivi":"-"},"00200":{"kerros":"4891","kaikki":"4899","rivi":"5730"},"00360":{"kerros":"3331","kaikki":"3373","rivi":"-"},"00560":{"kerros":"4326","kaikki":"4632","rivi":"-"},"00530":{"kerros":"4717","kaikki":"5039","rivi":"-"},"00240":{"kerros":"4094","kaikki":"4456","rivi":"-"},"00130":{"kerros":"6680","kaikki":"7153","rivi":"-"},"00100":{"kerros":"5868","kaikki":"5979","rivi":"-"},"00300":{"kerros":"4175","kaikki":"4278","rivi":".."},"00760":{"kerros":"2498","kaikki":"2830","rivi":"2921"},"00370":{"kerros":"3384","kaikki":"3168","rivi":"3667"},"00420":{"kerros":"2979","kaikki":"3006","rivi":"3213"},"00280":{"kerros":"4763","kaikki":"4799","rivi":"-"},"00720":{"kerros":"3025","kaikki":"3101","rivi":"2971"},"00700":{"kerros":"3093","kaikki":"3144","rivi":"3073"},"00740":{"kerros":"2451","kaikki":"2743","rivi":"2869"},"00780":{"kerros":"2894","kaikki":"3047","rivi":"3213"},"00150":{"kerros":"6291","kaikki":"6575","rivi":"-"},"00710":{"kerros":"2507","kaikki":"2583","rivi":"2647"},"00290":{"kerros":"..","kaikki":"..","rivi":"-"},"00880":{"kerros":"-","kaikki":"-","rivi":"-"},"00410":{"kerros":"2706","kaikki":"2634","rivi":"2561"},"00830":{"kerros":"3570","kaikki":"3443","rivi":"3901"},"00840":{"kerros":"2982","kaikki":"3219","rivi":"3450"},"00180":{"kerros":"5630","kaikki":"5751","rivi":".."},"00750":{"kerros":"2495","kaikki":"2655","rivi":"2951"},"00920":{"kerros":"2632","kaikki":"2672","rivi":"2809"},"00620":{"kerros":"3075","kaikki":"3314","rivi":"3208"},"00660":{"kerros":null,"kaikki":"2823","rivi":null},"00870":{"kerros":"2817","kaikki":"3044","rivi":"3772"},"00350":{"kerros":"4092","kaikki":"4082","rivi":".."},"00260":{"kerros":"5797","kaikki":"5896","rivi":"-"}}');

// get ref to fields in the card for manipulation
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
// helper to extract float from string
function parseFloatField(s) {
    if (!s || !s.innerText) {
        return null;
    }
    return s.innerText.replace(/[^0-9,]/g,"").replace(/,/,".");
}

function comparePriceAverage() {
    var pps = infoField("Neliöhinta");
    var ppsvalue = parseFloatField(pps);
    if (!ppsvalue) {
        pps = infoField("Myyntihinta");
        ppsvalue = parseFloat(parseFloatField(pps)/parseFloatField(infoField("Asuinpinta-ala")));
        pps.innerHTML += " = " + ppsvalue + " e/m<sup>2</sup>";
        console.log(pps.innerText);
    }
    var postalcode = /\d\d\d\d\d/.exec(infoField("Sijainti").innerText)[0];
    if (postalcode.search(/^00/)) {
        //only hel included
        return;
    }
    // determine avg prices
    var avg = "?";
    var n = avgprices[postalcode];
    if (n) {
        var type = infoField("Rakennuksen tyyppi");
        var t = "kaikki";
        if (type) {
            if (type.innerText.search(/Kerrostalo/i) != -1) {
                t = "kerros";
            } else if (type.innerText.search(/Rivitalo/i) != -1 || type.innerText.search(/Paritalo/i) != -1) {
                t = "rivi";
            } else {
                t = "kaikki";
            }
            if (!n[type]) {
                type = "kaikki";
            }
        }
        avg = n[type];
        // missing value if no sales or too few sales -> default to all
        if (avg == "-" || avg == "..") {
            type="kaikki";
            avg = n[type];
        }
    }
    var percent = Math.round(ppsvalue/parseFloat(avg)*100);
    pps.innerHTML += " = " + percent + "% of avg 2016: " + avg + " e/m<sup>2</sup> for " + postalcode + "/" + type;
    // paint it red if price more than 2016 avg for the zip +10%
    if (percent > 110 || percent < 80) {
        pps.style = "color: red;";
    }
}

function compareCosts() {
    // size of the apt
    var m2 = parseFloat(parseFloatField(infoField("Asuinpinta-ala")));
    // reasonable hv for electric and district heating
    var type = infoField("Rakennuksen tyyppi");
    var hv = infoField("Hoitovastike");
    var hvval = Math.round(parseFloat(parseFloatField(hv))/m2*10)/10;
    var heat = infoField("Lämmitys");
    var elheat = (heat.innerText.search(/kauko/i) == -1) && (heat.innerText.search(/sähkö/i) != -1);

    if (hv) {
        hv.innerHTML += " = " + hvval + " e/m<sup>2</sup>";
        if ((type && type.innerText.search(/Kerrostalo/i) == -1 && hvval > 3.3) || (elheat && hvval > 1.0) || (!elheat && hvval > 2.0)) {
            hv.style = "color: red;";
        }
        if (elheat) {
            hv.innerHTML += " check electricity costs";
        }
    }
    // TODO: el not used yet
    var el = infoField("Sähkökustannukset");

    var hk = infoField("Lämmityskustannukset");
    if (hk) {
        var hkval = Math.round(parseFloat(parseFloatField(hk))/m2*10)/10;
        hk.innerHTML += " = " + hkval + " e/m<sup>2</sup>";
        if (hkval > 1.5) {
            hk.style = "color: red;";
        }
    }

    var rv = infoField("Rahoitusvastike");
    if (rv) {
        var rvval = Math.round(parseFloat(rv.innerText.replace(/,/,"."))/m2*10)/10;
        rv.innerHTML += " = "+ rvval + " e/m<sup>2</sup>";
        if (rvval > 1.0) {
            rv.style = "color: red;";
        }
    }

    var dr = infoField("Tehdyt remontit");
    var by = infoField("Rakennusvuosi");
    if (by) {
        var age = (new Date()).getFullYear() - parseInt(by.innerText);
        if (age > 25) {
            by.style = "color: red;";
            by.innerHTML += " old building";
            if (!dr) {
                by.innerHTML += ", check repairs";
            }
        }
        if (dr) {
            dr.style = "color: red;";
            dr.innerHTML += '<br/>check repairs';
            // check pipes 40-50, roof 20-25, facade 20-30
            if (age > 40) {
                dr.innerHTML += " putket";
            }
            if (age > 20) {
                dr.innerHTML += " katto ja julkisivu";
            }
        }
    }

    var lo = infoField("Tontin omistus");
    if (lo) {
        if (lo.innerText.search(/oma/i) == -1 && lo.innerText.search(/vuokra/i != -1)) {
            lo.style = "color: red;";
        }
    }
    //TODO: Huoneistojen lukumäärä >= 4
}
