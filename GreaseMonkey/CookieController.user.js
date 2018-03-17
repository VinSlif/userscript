// ==UserScript==
// @name         Cookie Controller
// @description  Adds customized cookies to websites
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.3.3
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        http*://*/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @noframes
// ==/UserScript==

var cookie = {
    // Check what to do with cookie
    check: function (info) {
        // Check if cooke should be fully overwritten
        if (info.cookieInfo.assigner === null) {
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
                    var cEdit = cookie.read(info.cookieInfo.name).split(info.cookieInfo.delimiter),
                        cMake = info.cookieInfo.value,
                        cMade = [],
                        cFinal = '';

                    // Checks if values need to be created
                    cMade.length = cMake.length;
                    Util.init.setAll(cMade, false);

                    // Goes through all split cookie values
                    for (let i = 0, lenExist = cEdit.length; i < lenExist; i++) {
                        // Splits cookie value into encoded parts
                        var arrVal = cEdit[i].split(info.cookieInfo.assigner);

                        // Check if split cookie value is desired cookie value to edit
                        for (let j = 0, lenMake = info.cookieInfo.value.length; j < lenMake; j++) {
                            var makeVal = info.cookieInfo.value[j].split(info.cookieInfo.assigner);

                            // Change split value to desired value
                            if (arrVal[0] === makeVal[0]) {
                                if (arrVal[1] !== makeVal[1]) arrVal[1] = makeVal[1];
                                cMade[j] = true;
                            }
                        }

                        cEdit[i] = arrVal.join(info.cookieInfo.assigner);
                    }

                    for (let i = 0, lenMade = cMade.length; i < lenMade; i++)
                        if (cMade[i] == false) cEdit.push(cMake[i]);

                    cFinal = cEdit.join(info.cookieInfo.delimiter);

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
    siteCookie: function (host, cookieInfo, customEvent = function () {
        document.location.reload();
    }) {
        this.host = host;
        this.cookieInfo = cookieInfo;
        this.customEvent = customEvent;
    },
    // Cookie info object class constructor
    cookieInfo: function (name, value, assigner = null, delimiter = null) {
        this.name = name;
        this.value = value;
        this.assigner = assigner;
        this.delimiter = delimiter;
    }
};

// Maybe do: make table bodies draggable for order sorting?
var modal = {
    el: null,
    doShow: false,
    created: false,

    // need sidebar move in
    // https://www.w3schools.com/howto/howto_js_sidenav.asp

    // Need to normalize css
    // https://www.w3schools.com/cssref/css_default_values.asp
    tableCss: [
        // Normalize
        // Div
        ['#cookieModal',
         ['right', '1%'], ['top', '1%'], ['width', '40%'], ['height', '98%'], ['overflow-x', 'hidden'], ['background-color', 'white'], ['position', 'fixed'], ['right', '1%'], ['z-index', '999999999999999999999999999999999999999'], ['border', '0.2em solid black'], ['display', 'none']],
        ['#cookieModal *',
         ['font', '16px/normal Helvetica, "Trebuchet MS", Verdana, sans-serif'], ['all', 'revert']],
        //normal normal normal
        // h1
        ['#cookieModal > h1',
         ['margin', '1% auto'], ['text-align', 'center'], ['font-size', '1.25em']],
        // table
        ['#cookieTable',
         ['width', '96%'], ['margin', '0 auto 0.5em auto'], ['text-align', 'center'], ['border-collapse', 'collapse'], ['border-spacing', '2px']],
        ['#cookieTable > tbody > tr > th',
         ['text-align', 'center'], ['border-bottom', '2px solid black']],
        ['.cookieTableRow:nth-child(odd)',
         ['background-color', 'rgb(150, 150, 150)']],
        // table cells
        ['.cookieInfo > td',
         ['margin', '0 auto']],
        // Add info button
        ['#cookieAddInfo',
         ['height', '2em'], ['margin-left', '1em']],
        ['#cookieAddInfo > p',
         ['margin', '0 auto']],
    ],

    // Modal HTML string
    cookieModalStr: '<h1>Cookie Controller</h1>' +
        '<table id="cookieTable"><tbody><tr>' +
        '<th style="width: 40%">Site</th>' +
        '<th style="width: 15%">Cookie</th>' +
        '<th style="width: 15%">Value</th>' +
        '<th style="width: 10%">mult</th>' +
        '<th style="width: 10%">fn</th>' +
        '<th style="width: 10%">-</th>' +
        '</tr></tbody></table>' +
        '<button id="cookieAddInfo" type="button"><p>Add Cookie</p></button>',

    // Used to inject the modal + functionality into the page
    create: function () {
        // Checks if modal has already been created
        if (!modal.created) {
            // Adds own css rules
            Util.stylesheet.addStylesheetRules(modal.tableCss);
            
            // Crates the modal div
            let modDiv = document.createElement('DIV');
            modDiv.id = 'cookieModal';
            modDiv.innerHTML = modal.cookieModalStr;
            document.body.insertBefore(modDiv, document.body.firstElementChild);

            // Sets script reference
            modal.el = document.getElementById('cookieModal');

            // Adds click event listener
            document.getElementById('cookieAddInfo').addEventListener('click', function () {
                modal.addTableRow();
            });

            // Adds debug hide key
            document.addEventListener('keypress', function (e) {
                if (e.keyCode == 47) modal.hide(); // ? key
            });

            // Sets check token
            modal.created = true;
        }
    },

    show: function () {
        if (this.el) this.el.style.display = 'block';
    },

    hide: function () {
        if (this.el) this.el.style.display = 'none';
    },

    getGroup: function (el) {
        return el.parentElement.parentElement.parentElement;
    },

    confirmDelete: function (el) {
        if (confirm('Delete Entry?')) {
            let row = modal.getGroup(el);
            row.parentNode.removeChild(row);
        }
    },

    showMulti: function (el) {
        let row = modal.getGroup(el).querySelector('.cookieMultiVal');
        console.log(row);
        row.style = 'display: ' + (el.checked ? 'contents' : 'none');
    },

    showCustomFunc: function (el) {
        let row = modal.getGroup(el).querySelector('.cookieCustomFunc');
        row.style = 'display: ' + (el.checked ? 'contents' : 'none');
    },

    addTableRow: function (site = null, cookieName = null, cookieVal = null, hasMlt = false, hasFunc = false, mltAsgn = null, mltDelim = null, customFun = null) {
        // group itself
        var tbdy = document.createElement('TBODY'),
            // main row
            row = document.createElement('TR'),
            // site cell
            siteCell = document.createElement('TD'),
            siteCellIn = document.createElement('INPUT'),
            // cookie name cell
            ckNameCell = document.createElement('TD'),
            ckNameCellIn = document.createElement('INPUT'),
            // cookie value cell
            ckValCell = document.createElement('TD'),
            ckValCellIn = document.createElement('INPUT'),
            // show multi cell
            showMltCell = document.createElement('TD'),
            showMltCellIn = document.createElement('INPUT'),
            // show custom func cell
            showFuncCell = document.createElement('TD'),
            showFuncCellIn = document.createElement('INPUT'),
            // delete row cell
            delCell = document.createElement('TD'),
            delCellBtn = document.createElement('BUTTON'),
            delCellBtnP = document.createElement('P'),
            // multi row
            mltRow = document.createElement('TR'),
            mltRowAsgnCell = document.createElement('TD'),
            mltRowAsgnIn = document.createElement('INPUT'),
            mltRowDelimCell = document.createElement('TD'),
            mltRowDelimIn = document.createElement('INPUT'),
            // custom function row
            funcRow = document.createElement('TR'),
            funcRowCell = document.createElement('TD'),
            funcRowIn = document.createElement('TEXTAREA'),
            // spacer row
            spcer = document.createElement('TR'),
            spcerCell = document.createElement('TD');


        // set class names
        siteCellIn.className = 'cookieInfoSite';
        ckNameCellIn.className = 'cookieInfoName';
        ckValCellIn.className = 'cookieInfoValue';
        showMltCellIn.className = 'cookieInfoHasMult';
        showFuncCellIn.className = 'cookieInfoHasFunc';
        row.className = 'cookieInfo';
        mltRow.className = 'cookieMultiVal';
        funcRow.className = 'cookieCustomFunc';
        tbdy.className = 'cookieTableRow';

        // set border style
        spcerCell.style = 'height: 0.2em';

        // set styles
        delCellBtn.style = 'margin: 0 auto';
        delCellBtnP.style = 'margin: 0';
        mltRow.style.display = hasMlt ? 'contents' : 'none';
        funcRow.style.display = hasFunc ? 'contents' : 'none';
        mltRowAsgnIn.style = mltRowDelimIn.style = 'width: 96%';
        funcRowIn.style = 'width: 98%; overflow-y: auto;resize: none';

        // set colSpans
        funcRowCell.colSpan = spcerCell.colSpan = '6';
        mltRowAsgnCell.colSpan = '2';
        mltRowDelimCell.colSpan = '4';
        funcRowIn.rows = '4';

        // set input types
        siteCellIn.type = ckNameCellIn.type = ckValCellIn.type = mltRowAsgnIn.type = mltRowDelimIn.type = 'text';
        showMltCellIn.type = showFuncCellIn.type = 'checkbox';
        delCellBtn.type = 'button';

        // set displays
        siteCellIn.placeholder = 'example.com';
        ckNameCellIn.placeholder = 'cookieName';
        ckValCellIn.placeholder = 'val';
        delCellBtnP.innerHTML = '-';
        mltRowAsgnIn.placeholder = 'Assignment Character';
        mltRowDelimIn.placeholder = 'Delimiter Character';
        funcRowIn.placeholder = 'Custom function that will overwrite default page reload to apply the changes.\n' +
            '      *** WARNING ***\nThis can be harmful and inject unintended code.';

        // set input values
        siteCellIn.value = site;
        ckNameCellIn.value = cookieName;
        ckValCellIn.value = cookieVal;
        showMltCellIn.checked = hasMlt;
        showFuncCellIn.checked = hasFunc;
        mltRowAsgnIn.value = mltAsgn;
        mltRowDelimIn.value = mltDelim;
        funcRowIn.value = customFun;


        // set onclicks
        showMltCellIn.onclick = function () {
            modal.showMulti(this);
        };
        showFuncCellIn.onclick = function () {
            modal.showCustomFunc(this);
        };
        delCellBtn.onclick = function () {
            modal.confirmDelete(this);
        };

        // append spacer row
        spcer.appendChild(spcerCell);
        tbdy.appendChild(spcer);
        // append first row
        siteCell.appendChild(siteCellIn); // append site cell
        ckNameCell.appendChild(ckNameCellIn); // append name cell
        ckValCell.appendChild(ckValCellIn); // append value cell
        showMltCell.appendChild(showMltCellIn); // append multi check cell
        showFuncCell.appendChild(showFuncCellIn); // append custom func check cell
        delCellBtn.appendChild(delCellBtnP); // append delete cell button text
        delCell.appendChild(delCellBtn); // append delete cell
        row.appendChild(siteCell);
        row.appendChild(ckNameCell);
        row.appendChild(ckValCell);
        row.appendChild(showMltCell);
        row.appendChild(showFuncCell);
        row.appendChild(delCell);
        tbdy.appendChild(row);
        // append multi row
        mltRowAsgnCell.appendChild(mltRowAsgnIn);
        mltRow.appendChild(mltRowAsgnCell);
        mltRowDelimCell.appendChild(mltRowDelimIn);
        mltRow.appendChild(mltRowDelimCell);
        tbdy.appendChild(mltRow);
        // appen custom function row
        funcRowCell.appendChild(funcRowIn);
        funcRow.appendChild(funcRowCell);
        tbdy.appendChild(funcRow);
        // append spacer row
        tbdy.appendChild(spcer.cloneNode(true));
        // append table group to table
        let tble = document.getElementById('cookieTable');
        tble.appendChild(tbdy);
    },
};

// Store cookie information
var sitesArray = [
    new cookie.siteCookie('youtube.com', new cookie.cookieInfo('PREF', ['f6=40008', 'f5=30030'], '=', '&')),
    new cookie.siteCookie('kissmanga.com', new cookie.cookieInfo('vns_readType1', '1')),
    new cookie.siteCookie('merakiscans.com', new cookie.cookieInfo('readingType', 'one_pag')),
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

    // Menu toggle
    GM_registerMenuCommand(GM_info.script.name + ': toggle settings modal', function () {
        modal.doShow = !modal.doShow;
        if (modal.doShow) modal.show();
        else modal.hide();
    });

    var loc = location.host.replace('www.', '');

    // Create modal
    Util.event.onDocumentReady(modal.create);

    // YouTube uses HTML5 history api for page loading
    if (loc == 'youtube.com') {
        // https://stackoverflow.com/a/17128566
        // https://stackoverflow.com/a/34100952
        window.addEventListener('spfdone', modal.create); // old youtube design
        window.addEventListener('yt-navigate-start', modal.create); // new youtube design
    }

    // Find matching hostname
    for (let i = 0, len = sitesArray.length; i < len; i++)
        if (loc == sitesArray[i].host) cookie.check(sitesArray[i]);
})();
