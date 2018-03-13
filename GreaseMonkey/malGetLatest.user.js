// ==UserScript==
// @name         MyAnimeList Latest Release Checker
// @description  Accesses the latest releases information from mangaupdates.com and displays the latest released chapter of a series on the page
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.8.5
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/malGetLatest.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/malGetLatest.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        https://*.myanimelist.net/manga/*
// @match        https://*.myanimelist.net/mangalist/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

//* IMPORTANT KNOWN ISSUE *//
// Google may start to flag users for using a bot, which this is
// after checking for the latest releases.
// To fix this, just make a random google search and solve the Captcha
// Will try to alleviate the issue by bypassing google in future version

// Sets whether script should show the latest releases info
const showLatestReleases = true;


// Creates element tags
var createElem = {
    // Div tag
    div: function (str = '') {
        let newItem = document.createElement('DIV');
        newItem.appendChild(document.createTextNode(str));
        return newItem;
    },
    // Anchor tag
    anchor: function (str = [], src = '') {
        let newItem = document.createElement('A');
        newItem.appendChild(document.createTextNode(str.join('\n')));
        newItem.setAttribute('href', src);
        newItem.setAttribute('target', '_blank');
        newItem.style.whiteSpace = 'pre-wrap';
        newItem.style.wordWrap = 'break-word';
        newItem.style.textDecoration = 'none';
        return newItem;
    },
    // Span tag
    span: function (str = [], cls = null) {
        let newItem = document.createElement('SPAN');
        newItem.appendChild(document.createTextNode(str.join('\n')));
        if (cls) newItem.classList.add(cls);
        return newItem;
    },
    // Table Header tag
    tableHeader: function (str = '') {
        let newItem = document.createElement('TH');
        newItem.appendChild(document.createTextNode(str));
        newItem.classList.add('header-title');
        newItem.classList.add('releases');
        newItem.style.width = '100px';
        return newItem;
    },
    // Table Cell tag for Modern layout
    tableCellModern: function (str = '') {
        let newItem = document.createElement('TD');
        newItem.appendChild(document.createTextNode(str));
        newItem.classList.add('data');
        newItem.classList.add('release');
        newItem.style.whiteSpace = 'pre-wrap';
        newItem.style.wordWrap = 'break-word';
        return newItem;
    },
    // Bold tag
    bold: function (str = '') {
        let newItem = document.createElement('B');
        newItem.appendChild(document.createTextNode(str));
        return newItem;
    },
    // Table Cell tag for Classic Header layout
    tableCellClassicHeader: function (str = '') {
        let newItem = document.createElement('TD');
        newItem.appendChild(document.createTextNode(str));
        newItem.classList.add('table_header');
        newItem.classList.add('latest');
        newItem.setAttribute('width', '100');
        newItem.setAttribute('align', 'center');
        newItem.setAttribute('nowrap', 'nowrap');
        return newItem;
    },
    // Table Cell tag for Classic Entry layout
    tableCellClassicEntry: function (str = [], cls) {
        let newItem = document.createElement('TD');
        newItem.appendChild(document.createTextNode(str.join('\n')));
        newItem.classList.add(cls);
        newItem.setAttribute('width', '100');
        newItem.setAttribute('align', 'left');
        return newItem;
    },
};

// Release information object constructor
function releaseInfo(chap, t) {
    this.chap = chap; this.t = t;
}

// http request to mangaupdates for latest chapter release informaton
function getMangaReleaseInfo(query, loc, medType, isList = true) {
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://www.google.com/search?btnI=I&q=' + query + ' "' + medType + '" &sitesearch=mangaupdates.com/series.html?',
        headers: {
            referer: 'https://www.google.com/'
        },
        onload: function (res) {
            function showRelease(msg) {
                loc.removeChild(loc.lastChild); // Removes click for latest info text
                msg[0] = (isList ? '' : ' ') + msg[0]; // Adds space infront of text
                // Adds latest release info/error message + link to found page
                loc.appendChild(createElem.anchor(msg, res.finalUrl));
            }
            
            // Checks if requested search failed
            if (res.finalUrl.indexOf('google.com') !== -1) {
                showRelease(['Error: google search failed']);
                return;
            }
            
            // Gets the left side of the main content
            let leftDiv = Util.parse.html(res.responseText).querySelector('.sMember');
            if (!leftDiv) { // Checks if the left div exists
                showRelease(['Error: no sMember']);
                return;
            }
            
            // Gets all categories from the left side
            let sCatClass = leftDiv.getElementsByClassName('sCat');
            // Checks if the left categories exists
            if (!sCatClass) {
                showRelease(['Error: no sCat']);
                return;
            }
            
            // Store the release information
            let releases = null, // release info
                inf = [], // individual release info DOM elements
                latest = []; // sorted release info
            
            // Gets the Release category from the manga entry page
            for (let i = 0, lenCats = sCatClass.length; i < lenCats; i++) // Goes through all categories on left side
                if (sCatClass[i].firstChild.innerHTML == 'Latest Release(s)') { // Gets index of release category
                    releases = leftDiv.getElementsByClassName('sContent')[i]; // returns release from category index
                    break;
                }
            
            // Goes through each child of the release content
            for (let i = 0, len = releases.childElementCount; i < len; i++) {
                if (releases.children[i].tagName == 'I') inf.push(releases.children[i]); // Pushes latest volume + chapter released
                if (releases.children[i].tagName == 'SPAN') inf.push(releases.children[i]); // Pushes how long ago chapter released
            }

            // Sorts the released chapter info into a single object
            for (let i = 0, len = inf.length; i < len; i++) {
                if (inf[i].tagName == 'SPAN') // Finds end of release entry
                    if (inf[i - 2] != null && inf[i - 2].tagName == 'I') // Checks if volume entry exists
                        latest.push(new releaseInfo('v.' + inf[i - 2].innerHTML + ' c.' + inf[i - 1].innerHTML, inf[i].innerHTML.replace('about ', '')));
                    else
                        latest.push(new releaseInfo('c.' + inf[i - 1].innerHTML, inf[i].innerHTML.replace('about ', '')));
            }
            
            // Checks if release information was found
            if (latest.length > 0)
                showRelease(isList ? [latest[0].chap, latest[0].t] : [latest[0].chap + ' - ' + latest[0].t]);
            else
                showRelease(['No releases found']);
        }
    });
}


var addReleaseInfo = {
    // Adds the release info to a mangas info page
    mangaPage: function (sideBar) {
        let statHIndex = Array.prototype.indexOf.call(sideBar.children, sideBar.getElementsByTagName('H2')[2]),
            statIIndex = Array.prototype.indexOf.call(sideBar.children, sideBar.getElementsByTagName('H2')[1]),
            newInfo = createElem.div(),
            name = document.querySelector('[itemprop=name]').innerHTML;

        newInfo.appendChild(createElem.span(['Latest:'], 'dark_text'));
        let temp = newInfo.appendChild(createElem.span([' Get latest']));

        temp.addEventListener('click', function (e) {
            if (e.currentTarget.triggered) return;
            e.currentTarget.triggered = true;
            getMangaReleaseInfo(name, newInfo, sideBar.children[statIIndex + 1].lastElementChild.innerHTML.toLowerCase(), false);
        });

        sideBar.insertBefore(newInfo, sideBar.children[statHIndex - 1]);
    },

    // Adds the release info to modern manga lists
    mangaListModern: function (tableHeader) {
        let titles = document.getElementsByClassName('list-item');

        // Check if Table Header already has final column
        if (!tableHeader.lastChild.classList.contains('releases'))
            // Add Table Header for released chapters
            tableHeader.insertBefore(createElem.tableHeader('Latest'), tableHeader.lastChild.nextSibling);

        // Send http requests for each title
        for (let i = 0, len = titles.length; i < titles.length; i++) {
            // Checks if entry has already been filled
            let loc = titles[i].querySelector('.list-table-data').lastChild;
            if (loc.classList.contains('release')) continue;

            let name = titles[i].querySelector('.title').firstChild.innerHTML, // httprequest to get type from page
                newElem = createElem.tableCellModern();

            newElem.appendChild(createElem.span(['click for latest']));
            newElem.addEventListener('click', function (e) {
                if (e.currentTarget.triggered) return;
                e.currentTarget.triggered = true;
                getMangaReleaseInfo(name, loc.nextSibling, 'manga');
            });

            // click to get latest release
            loc.parentElement.insertBefore(newElem, loc.nextSibling);
        }
    },

    // Mutation observer for modern layout
    modernMutObsv: new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            let loc = mutation.addedNodes[0].querySelector('.list-table-data').lastChild,
                name = mutation.addedNodes[0].querySelector('.title').firstChild.innerHTML,
                newElem = createElem.tableCellModern();

            newElem.appendChild(createElem.span(['click for latest']));
            newElem.addEventListener('click', function (e) {
                if (e.currentTarget.triggered) return;
                e.currentTarget.triggered = true;
                getMangaReleaseInfo(name, loc.nextSibling, 'manga');
            });

            // click to get latest release
            loc.parentElement.insertBefore(newElem, loc.nextSibling);
        });
    }),

    // Adds the release info to classic mangalists
    mangaListClassic: function (conDiv) {
        let t = conDiv.querySelectorAll('TABLE');

        // Add Latest Release entrys
        for (let i = 0, len = t.length; i < len; i++) {
            if (t[i].classList.contains('header_cw')) this.checkForChildReleaseTable(t[i]); // Reading header
            if (t[i].classList.contains('header_completed')) this.checkForChildReleaseTable(t[i]); // Completed header
            if (t[i].classList.contains('header_onhold')) this.checkForChildReleaseTable(t[i]); // On Hold header
            if (t[i].classList.contains('header_dropped')) this.checkForChildReleaseTable(t[i]); // Dropped header
            if (t[i].classList.contains('header_ptw')) this.checkForChildReleaseTable(t[i]); // Plan to Read header
            if (t[i].querySelector('.td1')) this.checkForChildLatestTable(t[i], 'td1'); // latest info request
            if (t[i].querySelector('.td2')) this.checkForChildLatestTable(t[i], 'td2'); // latest info request
        }
    },

    // Checks for the Latest Release Header for the manga list entry headers
    checkForChildReleaseTable: function (el) {
        let temp = el.nextElementSibling.querySelectorAll('.table_header'),
            last = temp[temp.length - 1];
        
        // Adds Header display
        if (last.getElementsByClassName('latest').length == 0) {
            let newElem = createElem.tableCellClassicHeader();
            newElem.appendChild(createElem.bold('Latest'));
            el.nextElementSibling.querySelector('TR').appendChild(newElem);
        }
    },

    // Adds latest release info entry
    checkForChildLatestTable: function (el, cls) {
        let temp = el.getElementsByClassName(cls),
            last = temp[temp.length - 1];
        
        if (last.getElementsByClassName('latest').length == 0) {
            let newElem = createElem.tableCellClassicEntry([], cls),
                name = el.querySelector('.animetitle').firstElementChild.innerHTML;

            newElem.appendChild(createElem.span(['click for', 'latest'], 'latest'));
            newElem.addEventListener('click', function (e) {
                if (e.currentTarget.triggered) return;
                e.currentTarget.triggered = true;
                getMangaReleaseInfo(name, newElem, 'manga');
            });

            el.querySelector('TR').appendChild(newElem);
        }
    }
};


(function () {
    'use strict';

    if (showLatestReleases) {
        // Checks if on specific page type
        let tH = document.querySelector('.list-table-header'), // mangalist (modern)
            lS = document.getElementById('list_surround'), // mangalist (classic)
            sB = document.querySelector('.js-scrollfix-bottom'); // manga page

        if (tH) {
            addReleaseInfo.mangaListModern(tH); // For the inital loaded list of entries
            addReleaseInfo.modernMutObsv.observe(document.querySelector('[data-items]'), { childList: true });
        } else if (lS) addReleaseInfo.mangaListClassic(lS);
        else if (sB) addReleaseInfo.mangaPage(sB);
    }
})();