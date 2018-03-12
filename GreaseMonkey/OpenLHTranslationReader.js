// ==UserScript==
// @name         Open LHTranslation Reader
// @namespace    na
// @version      1.0
// @description  Skips all transcription pages to directly open the reader for the chapter whenever possible
// @author       You
// @match        http://lhtranslation.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Requests page info from link
function httpRequest(title, thumb, readBtn) {
    GM_xmlhttpRequest({
        synchronous: false,
        method: 'GET',
        url: title.href,
        onload: function (res) {
            // Gets starting index of reader link
            let txt = res.responseText,
                start = txt.indexOf('http://read.');
            // Checks if reader link exists, Changes anchor references to directly to reader page
            if (start !== -1) title.href = thumb.href = readBtn.href = txt.substr(start, txt.indexOf('.html', start) - start) + '.html';
        }
    });
}

(function () {
    'use strict';
    // Gets individual chapter entries
    var chapterEntries = document.getElementById('content').getElementsByTagName('article');
    // Checks if articles for chapter links exist, Goes through each chapter article, Creates request to change entry links
    if (chapterEntries.length > 0) for (let i = 0, len = chapterEntries.length; i < len; i++) httpRequest(chapterEntries[i].getElementsByClassName('title')[0].childNodes[1], chapterEntries[i].getElementsByClassName('featured-thumbnail')[0].parentNode, chapterEntries[i].getElementsByClassName('readMore')[0].childNodes[1]);
    else {
        // Sets the window location to reader link
        var allLinks = document.links;
        for (let i = 0, len = allLinks.length; i < len; i++) {
            var link = allLinks[i];
            if (link.href.indexOf('http://read.') !== -1) window.location = link.href;
        }
    }
})();