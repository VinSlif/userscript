// ==UserScript==
// @name         r/manga New Releases Checker
// @description  Displays new chapter releases from r/manga
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.3
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/rmangaNewChecker.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/rmangaNewChecker.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        http*://*.reddit.com/r/manga/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

//* THIS SCRIPT IS A WORK IN PROGRESS *//

// How many pages should be parsed before stopping
const pagesToCheck = 4;

// How often this should check for new updates (in seconds)
const refreshTime = 5 * 60;

// Checks how many pages have been checked
var checkedCnt = 0;

// entry info
var dispMsg = [];


// Displays message
function displayFoundNewChapters(data) {
    for (let i = 0, len = data.length; i < len; i++) console.log(data[i]);
}

// Gets the JSON of the current page being parsed
function getJSON(pageEncode = null) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://www.reddit.com/r/manga/new.json' + (pageEncode ? pageEncode : ''),
        onload: function (res) {
            // Gets all of the links from the response text
            let listLink = JSON.parse(res.responseText).data.children;

            // Goes through all links
            for (let i = 0, len = listLink.length; i < len; i++) {
                // Gets the individual entry
                let entry = listLink[i].data;

                // Checks if [DISC] tag is in the title or flair, adds to array if found
                if (entry.title.indexOf('[DISC]') !== -1 || entry.link_flair_text == '[DISC]') {
                    let msg = entry.title.replace('[DISC] ', '') +
                        '\n' + entry.url +
                        '\nhttps://www.reddit.com' + entry.permalink;

                    if (!dispMsg.includes(msg)) dispMsg.push(msg);
                }
            }

            // Checks how many pages have been parsed
            checkedCnt++;
            // If pages still need to be checked, get the next pages encoded url
            if (checkedCnt < pagesToCheck) getNextPage(pageEncode);
            // Displays all entries
            else displayFoundNewChapters(dispMsg);
        }
    });
}

// Gets the next pages encoded url
function getNextPage(pageEncode = null) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://www.reddit.com/r/manga/new' + (pageEncode ? pageEncode : ''),
        onload: function (res) {
            // Gets the encoded url for the next page
            let hrefStr = Util.parseHTML(res.responseText).querySelector('.next-button').firstElementChild.href;
            // Gets the next pages JSON
            getJSON(hrefStr.substr(hrefStr.indexOf('/?count') + 1));
        }
    });
}

(function () {
    'use strict';
    // Initial release check
    checkedCnt = 0;
    getJSON();

    // Checks for new releases at an interval
    var check = setInterval(function () {
        // Restarts cycle
        checkedCnt = 0;
        getJSON();
    }, refreshTime * 1000);
})();
