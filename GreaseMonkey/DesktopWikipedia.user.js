// ==UserScript==
// @name         Desktop Wikipedia
// @description  Forces the full desktop version of Wikipedia
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      1.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DesktopWikipedia.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DesktopWikipedia.user.js
// @match        https://*.wikipedia.org/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// Allow the use of the simplified english version of wikipedia
const AllowSimpleEnglish = false;

(function () {
    'use strict';

    let loc = window.location;

    // Checks for mobile version of wikipedia
    if (loc.host.indexOf('.m.') !== -1) window.location.href = loc.href.replace('.m.', '.');
    // Checks for simple english version of wikipedia
    if (!AllowSimpleEnglish && loc.host.indexOf('simple.') !== -1) window.location.href = loc.href.replace('simple.', 'en.');

})();
