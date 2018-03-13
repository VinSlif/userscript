// ==UserScript==
// @name         r/manga New Releases Checker
// @description  Displays new chapter releases from r/manga
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.3.5
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/rmangaNewChecker.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/rmangaNewChecker.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        http*://*.reddit.com/r/manga/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

//* THIS SCRIPT IS A WORK IN PROGRESS *//

var checkData = {
    // How many pages should be parsed before stopping
    pagesToCheck: 4,
    // How often this should check for new updates (in seconds)
    refreshTime: 5 * 60,
    // Checks how many pages have been checked
    cnt: 0,
    // Info to be displayed
    dispMsg: [],

    // Starts parsing process
    startProcessing: function() {
        this.cnt = 0;
        redditData.getJSON();
    },
    
    // Adds new link to data
    addData: function (data) {
        if (!this.dispMsg.includes(data)) this.dispMsg.push(data);
    },

    // Checks how many pages have been parsed
    checkPagesParsed: function (encodeURL) {
        this.cnt++;
        // If pages still need to be checked, get the next pages encoded url
        if (this.cnt < this.pagesToCheck) redditData.getNextPage(encodeURL);
        // Displays all entries
        else for (let i = 0, len = this.dispMsg.length; i < len; i++) Util.log(this.dispMsg[i].title + '\n' + this.dispMsg[i].permalink);
    },
    
    // Object constructor for link entries found from JSON
    linkInfo: function (title, url, permalink) {
        this.title = title; this.url = url; this.permalink = permalink;
    },
};

// Gets data from Reddit
var redditData = {
    // Gets the JSON of the current page being parsed and checks if need
    getJSON: function (pageEncode = null) {
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
                        // Adds link info to collected data
                        let info = new checkData.linkInfo(entry.title.replace('[DISC] ', ''), entry.url, 'https://www.reddit.com' + entry.permalink);
                        checkData.addData(info);
                    }
                }

                // Checks for the number of pages to be parsed
                checkData.checkPagesParsed(pageEncode);
            }
        });
    },

    // Gets the next pages encoded url and makes JSON request
    getNextPage: function (pageEncode = null) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://www.reddit.com/r/manga/new' + (pageEncode ? pageEncode : ''),
            onload: function (res) {
                // Gets the encoded url for the next page
                let hrefStr = Util.parseHTML(res.responseText).querySelector('.next-button').firstElementChild.href;
                // Gets the next pages JSON
                redditData.getJSON(hrefStr.substr(hrefStr.indexOf('/?count') + 1));
            }
        });
    }
};

(function () {
    'use strict';
    // Initial release check
    checkData.startProcessing();

    // Checks for new releases at an interval
    var check = setInterval(function () {
        // Restarts cycle
        checkData.startProcessing();
    }, checkData.refreshTime * 1000);
})();
