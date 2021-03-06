// ==UserScript==
// @name         Desktop Wikipedia
// @description  Forces the full desktop version of Wikipedia
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      1.1.3
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DesktopWikipedia.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DesktopWikipedia.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        https://*.wikipedia.org/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @noframes
// ==/UserScript==

// Allow the use of the simplified english version of wikipedia
var allowSimple = typeof Util.store.get('allowSimple') !== 'undefined' ? Util.store.get('allowSimple') : false;

(function () {
    'use strict';

    GM_registerMenuCommand(GM_info.script.name + ': toggle allowSimple', function () {
        if (confirm((allowSimple ?
                'Prevent Wikipedia\'s simple english version from appearing.' :
                'Allow Wikipedia\'s simple english version to appear.'))) {
            allowSimple = !allowSimple;
            Util.store.set('allowSimple', allowSimple);
        }
    });

    // Used to check wikipedia version
    let loc = window.location;
    // Checks for mobile version of wikipedia
    if (loc.hostname.indexOf('.m.') !== -1) window.location = loc.href.replace('.m.', '.');
    // Checks for simple english version of wikipedia
    if (allowSimple && loc.hostname.indexOf('simple.') !== -1) window.location = loc.href.replace('simple.', 'en.');
})();