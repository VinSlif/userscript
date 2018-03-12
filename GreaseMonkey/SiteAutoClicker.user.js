// ==UserScript==
// @name         Site Auto Clicker
// @namespace    na
// @version      0.1
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @description  Automatically clicks a specified element for a site
// @author       VinSlif
// @match        http*://*/*
// @grant        none
// @noframes
// ==/UserScript==

var sitesArray = [
    new elementClicker('imgur.com', '.post-loadall'),
    //new elementClicker('reddit.com', '.skip-for-now'),
];

// Element click object constructor
function elementClicker(host, el) {
    this.host = host; this.el = el;
}

// Clicks an element
function click(elementID) {
    var el = document.querySelector(elementID);
    if (el !== null) el.click();
}

(function () {
    'use strict';

    // Find matching hostname
    var loc = location.host.replace('www.', '');
    for (let i = 0, len = sitesArray.length; i < len; i++) if (loc == sitesArray[i].host) click(sitesArray[i].el);
})();
