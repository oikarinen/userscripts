// ==UserScript==
// @name        Oikotie google maps - delete
// @namespace   http://tampermonkey.net/
// @description Google maps directions & travel time to apartments sold in oikotie
// @include     https://asunnot.oikotie.fi/myytavat-asunnot*
// @version     0.1
// @run-at      document-start
// @license     All rights reserved.
// ==/UserScript==

// from https://github.com/jspenguin2017/Snippets/blob/master/onbeforescriptexecute.html
// Library code, licensed under MIT
(() => {
    "use strict";
    const Event = class {
        constructor(script, target) {
            this.script = script;
            this.target = target;
            this._cancel = false;
            this._replace = null;
            this._stop = false;
        }
        preventDefault() {
            this._cancel = true;
        }
        stopPropagation() {
            this._stop = true;
        }
        replacePayload(payload) {
            this._replace = payload;
        }
    };
    let callbacks = [];
    window.addBeforeScriptExecuteListener = (f) => {
        if (typeof f !== "function") {
            throw new Error("Event handler must be a function.");
        }
        callbacks.push(f);
    };
    window.removeBeforeScriptExecuteListener = (f) => {
        let i = callbacks.length;
        while (i--) {
            if (callbacks[i] === f) {
                callbacks.splice(i, 1);
            }
        }
    };
    const dispatch = (script, target) => {
        if (script.tagName !== "SCRIPT") {
            return;
        }
        const e = new Event(script, target);
        if (typeof window.onbeforescriptexecute === "function") {
            try {
                window.onbeforescriptexecute(e);
            } catch (err) {
                console.error(err);
            }
        }
        for (const func of callbacks) {
            if (e._stop) {
                break;
            }
            try {
                func(e);
            } catch (err) {
                console.error(err);
            }
        }
        if (e._cancel) {
            script.textContent = "";
            script.remove();
        } else if (typeof e._replace === "string") {
            script.textContent = e._replace;
        }
    };
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const n of m.addedNodes) {
                dispatch(n, m.target);
            }
        }
    });
    observer.observe(document, {
        childList: true,
        subtree: true,
    });
})();

// Only works for hard coded scripts, dynamically inserted scripts
// will execute before it can be cancelled
//
// You can patch `Element.prototype.prepend`,
// `Element.prototype.append`, and related functions to interfere with
// dynamically inserted scripts
//
// Also, textContent is not always set properly, especially when the
// script is big
// Compatibility:
//
// Browser    - Cancel Script - Change Script
// Chrome 67  - Yes           - Yes
// Edge 41    - Yes           - Yes
// Firefox 60 - Partially     - Yes
//
// Only inline scripts can be cancelled on Firefox
// Example code, public domain
(() => {
    "use strict";
    window.onbeforescriptexecute = (e) => {

        if (e.script.outerHTML && e.script.outerHTML.search(/AIzaSyCIUJd77inXgATBJVox0IZwiIK8enVGoyM/) != -1) {
            console.log("Removing google maps api script:");
            console.log(e.script.outerHTML);
            e.preventDefault();
        }
        /*
        if (e.script.textContent && e.script.textContent.includes("new google.maps")) {
            console.log("Adding google ref for script:");
            console.log(e.script.textContent);
            // Change the code that runs
            e.replacePayload("const google = unsafeWindow.google;\n"+e.script.textContent);
            // Later event handlers can override your payload, you
            // can call e.stopPropagation to make sure the current
            // payload is applied
            e.stopPropagation();
         }
         */
    };
    function addMaps() {
        var script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=XXXXXXXXXX";
        script.async = false;
        var first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(script, first);
    }
    addMaps();
})();
