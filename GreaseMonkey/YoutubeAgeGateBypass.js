// ==UserScript==
// @name         YouTube Age Gate Bypass
// @namespace    na
// @version      0.5
// @description  Places an embedded version of the video to bypass YouTube age verifcation
// @author       VinSlif
// @match        *://*.youtube.com/*
// @grant        none
// @noframes
// ==/UserScript==

// ToDo
// have IFrame mimic video player style > responseive width/height
// show related videos?
//  may be impossible

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

// Applies custom console log formatting (for GM scripts)
function log() {
    var args = [].slice.call(arguments);
    args.unshift('%c' + GM_info.script.name + ':', 'font-weight: bold;color: purple;');
    console.log.apply(console, args);
}

(function () {
    'use strict';

    // YouTube uses HTML5 history api for page loading
    // https://stackoverflow.com/a/17128566
    // https://stackoverflow.com/a/34100952
    window.addEventListener("spfdone", checkAgeRestriction); // old youtube design
    window.addEventListener("yt-navigate-start", checkAgeRestriction); // new youtube design

    document.addEventListener("DOMContentLoaded", checkAgeRestriction); // one-time early processing
    window.addEventListener("load", checkAgeRestriction); // one-time late postprocessing 
})();
