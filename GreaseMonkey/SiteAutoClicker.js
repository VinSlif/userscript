// ==UserScript==
// @name         Site Auto Clicker
// @namespace    na
// @version      0.1
// @description  Automatically clicks a specified element for a site
// @author       You
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
    /*else {
        var i = 0, check = setInterval(function() {
            el = document.querySelector(elementID);
            console.log(el);
            if (el !== null || i > 10) {
                clearInterval(check);
                el.click();
            }
            i++;
        });
    }*/
}

(function () {
    'use strict';

    // Find matching hostname
    var loc = location.host.replace('www.', '');
    for (let i = 0, len = sitesArray.length; i < len; i++) if (loc == sitesArray[i].host) click(sitesArray[i].el);
})();
