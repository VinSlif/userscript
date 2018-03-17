// ==UserScript==
// @name         YouTube Age Gate Bypass
// @description  Places an embedded version of the video to bypass YouTube age verifcation
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.5.1
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/YoutubeAgeGateBypass.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/YoutubeAgeGateBypass.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        *://*.youtube.com/*
// @grant        none
// @noframes
// ==/UserScript==

// Creates an embedded youtube IFrame below the video
function createIFrameVideo(videoID) {
    let iframe = document.createElement('iframe'),
        parentElem = document.getElementById('content');

    // Set IFrame attributes
    iframe.src = 'https://www.youtube.com/embed/' + videoID + "?autoplay=1";
    iframe.width = '640';
    iframe.height = '360';

    // Places IFrame below video player
    parentElem.insertBefore(iframe, parentElem.children[1]);

    return iframe;
}

function checkAgeRestriction() {
    // Checks if the unavailable player is age gated
    if (document.getElementById('watch7-player-age-gate-content') !== null) {
        // Create an IFrame based on videoId itemprop
        var newDisp = createIFrameVideo(document.getElementById('watch7-content').querySelector('[itemprop=videoId]').content);

        // Edit IFrame style
        newDisp.setAttribute('style', 'margin-bottom:5px;z-index:0;color:#fff;margin-left:auto;margin-right:auto;position:relative;');

        // Hide other video elements
        document.getElementById('player-unavailable').classList.add('hid'); // Age restricted message
        document.getElementById('placeholder-player').classList.add('hid'); // Actual video player
    }
}

(function () {
    'use strict';

    // Detect when page has loaded
    Util.event.onDocumentReady(checkAgeRestriction);    
})();
