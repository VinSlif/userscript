// ==UserScript==
// @name         Cookie Controller
// @description  Adds customized cookies to websites
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.2.5
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        http*://*/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

//* USAGE *//
// Users must add the sites and cookies to change
// at the bottom of this script in the the
// sitesArray variable

var cookie = {
    // Check what to do with cookie
    check: function (info) {
        // Check if cooke should be fully overwritten
        if (info.cookieInfo.split === null) {
            var cCreate = this.read(info.cookieInfo.name);

            // Check if cookie exists and is correct value
            if (cCreate === null || cCreate != info.cookieInfo.value) {
                this.setCookie(info.cookieInfo.name, info.cookieInfo.value, info.host);
                info.customEvent();
            }
        } else {
            // Check if cookie exists
            var checker = setInterval(function () {
                if (cookie.read(info.cookieInfo.name)) {
                    clearInterval(checker);

                    // Edits existing cookie value
                    var cEdit = cookie.read(info.cookieInfo.name).split(info.cookieInfo.join),
                        cMake = info.cookieInfo.value,
                        cMade = [], cFinal = '';

                    // Checks if values need to be created
                    cMade.length = cMake.length;
                    Util.setAll(cMade, false);

                    // Goes through all split cookie values
                    for (let i = 0, lenExist = cEdit.length; i < lenExist; i++) {
                        // Splits cookie value into encoded parts
                        var arrVal = cEdit[i].split(info.cookieInfo.split);

                        // Check if split cookie value is desired cookie value to edit
                        for (let j = 0, lenMake = info.cookieInfo.value.length; j < lenMake; j++) {
                            var makeVal = info.cookieInfo.value[j].split(info.cookieInfo.split);

                            // Change split value to desired value
                            if (arrVal[0] === makeVal[0]) {
                                if (arrVal[1] !== makeVal[1]) arrVal[1] = makeVal[1];
                                cMade[j] = true;
                            }
                        }

                        cEdit[i] = arrVal.join(info.cookieInfo.split);
                    }

                    for (let i = 0, lenMade = cMade.length; i < lenMade; i++)
                        if (cMade[i] == false) cEdit.push(cMake[i]);

                    cFinal = cEdit.join(info.cookieInfo.join);

                    // Check if cookie value has been changed
                    if (cFinal != cookie.read(info.cookieInfo.name)) {
                        // Apply cookie value changes
                        cookie.setCookie(info.cookieInfo.name, cFinal, info.host);
                        info.customEvent();
                    }
                }
            }, 500);
        }
    },

    // Sets the cookie
    setCookie: function (name, value, domain) {
        var d = new Date();
        d.setTime(d.getTime() + (100 * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';domain=.' + domain + ';hostonly=false;path=/';
    },

    // Parse loaded cookies
    read: function (name) {
        var nameEQ = name + '=',
            ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    // Site actions object class constructor
    siteCookie: function (host, cookieInfo, customEvent = function () { document.location.reload(); }) {
        this.host = host; this.cookieInfo = cookieInfo; this.customEvent = customEvent;
    },
    // Cookie info object class constructor
    cookieInfo: function (name, value, split = null, join = null) {
        this.name = name; this.value = value; this.split = split; this.join = join;
    }
};


// Store cookie information
// Examples
var sitesArray = [
    // Forces old youtube layout and autoplay off
    new cookie.siteCookie('youtube.com', new cookie.cookieInfo('PREF', ['f6=40008', 'f5=30030'], '=', '&')),
    new cookie.siteCookie('redditp.com', new cookie.cookieInfo('shouldAutoNextSlideCookie', 'false')),
    new cookie.siteCookie('reddit.com', new cookie.cookieInfo('over18', '1'), function () {
        if (location.pathname.indexOf('over18') !== -1) {
            let over18red = location.href;
            document.location = decodeURIComponent(over18red.substr(over18red.indexOf('?dest=') + 6));
        } else document.location.reload();
    }),
];

(function () {
    'use strict';
    // Find matching hostname
    var loc = location.host.replace('www.', '');
    for (let i = 0, len = sitesArray.length; i < len; i++) if (loc == sitesArray[i].host) cookie.check(sitesArray[i]);
})();
