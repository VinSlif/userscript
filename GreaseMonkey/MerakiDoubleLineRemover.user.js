// ==UserScript==
// @name         Remove Meraki Scans Double Line Break
// @description  Removes the double line breaks from Meraki Scans long strip reading mode.
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.1.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/MerakiDoubleLineRemover.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/MerakiDoubleLineRemover.user.js
// @match        *://*.merakiscans.com/*
// @grant        none
// @noframes
// ==/UserScript==

// Keeps a reference to the button
var btn = null;

// Create button to trigger removal
function createButton() {
    btn = document.createElement('BUTTON');
    btn.innerHTML = 'Remove Page Spacing';
    btn.style = 'position:-webkit-sticky;position:sticky;bottom:1em;left:1em';
    btn.addEventListener('click', removeSecondBreaks);
    document.body.appendChild(btn);
}

// Removes the line breaks
function removeSecondBreaks() {
    // Gets the the container for long strip mode
    let imgCntnr = document.getElementById('longWrap');

    // Removes every third (3rd) element from the end
    for (let i = imgCntnr.childElementCount - 1; i > 0; i -= 3)
        imgCntnr.removeChild(imgCntnr.childNodes[i]); // Should be a br element

    // Removes button
    btn.parentElement.removeChild(btn);
}

(function () {
    'use strict';

    createButton();
})();
