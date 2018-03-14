// ==UserScript==
// @name         Cookie Controller
// @description  Adds customized cookies to websites
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.3.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/CookieController.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @match        http*://*/*
// @run-at       document-start
// @grant        none
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
    siteCookie: function (host, cookieInfo, customEvent = function () { document.location.reload(); }) {
        this.host = host; this.cookieInfo = cookieInfo; this.customEvent = customEvent;
    },
    // Cookie info object class constructor
    cookieInfo: function (name, value, assigner = null, delimiter = null) {
        this.name = name; this.value = value; this.assigner = assigner; this.delimiter = delimiter;
    }
};

// Maybe do: make table bodies draggable for order sorting?
var modal = {
    // need sidebar move in
    // https://www.w3schools.com/howto/howto_js_sidenav.asp
    
    tableCss: [['.cookieTable:nth-child(odd)', ['background-color', 'rgb(150, 150, 150)']]],

    cookieModalStr: '<div style="right: 1%; top: 1%; height: 98%; position: fixed; z-index: 99999; background-color: white; overflow-x: hidden; width: 40%; display:none;">' +
        '<h1 style="text-align: center; margin: 0 auto 1% auto; font-size: 1.25em">Set Cookies</h1>' +
        '<table id="rel_table" style="width: 96%; margin: 0 auto 0.5em auto; text-align: center; border-collapse: collapse">' +
        '<tbody>' +
        '<tr>' +
        '<th style="width: 40%; border-bottom: 2px solid black;">Site</th>' +
        '<th style="width: 15%; border-bottom: 2px solid black;">Cookie</th>' +
        '<th style="width: 15%;border-bottom: 2px solid black;">Value</th>' +
        '<th style="width: 10%;border-bottom: 2px solid black;">mult</th>' +
        '<th style="width: 10%;border-bottom: 2px solid black;">fn</th>' +
        '<th style="width: 10%;border-bottom: 2px solid black;">-</th>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<button id="cookieAddInfo" type="button" style="height: 2em; margin-left: 1em">' +
        '<p style="margin: 0 auto">Add Cookie</p>' +
        '</button>' +
        '</div>',

    create: function() {
        Util.stylesheet.addStylesheetRules(this.tableCss);
        document.body.innerHTML += this.cookieModalStr;
        document.getElementById('cookieAddInfo').addEventListener('click', function() { modal.addTableRow(); });
    },
    
    getGroup: function (el) { return el.parentElement.parentElement.parentElement; },

    confirmDelete: function (el) {
        let doDel = confirm('Delete Entry?');
        if (doDel) {
            let row = modal.getGroup(el);
            row.parentNode.removeChild(row);
        }
    },

    showMulti: function (el) {
        let row = modal.getGroup(el).querySelector('.cookieMultiVal');
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
        tbdy.className = 'cookieTable';

        // set border style
        siteCell.style = ckNameCell.style = ckValCell.style = showMltCell.style = showFuncCell.style = 'border-right: 1px solid rgb(200, 200, 200);';
        spcerCell.style = 'height: 0.1em';

        // set styles
        delCellBtn.style = 'margin: 0 auto';
        delCellBtnP.style = 'margin: 0';
        mltRow.style = 'display: ' + (hasMlt ? 'contents' : 'none');
        funcRow.style = 'display: ' + (hasFunc ? 'contents' : 'none');
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
        showMltCellIn.onclick = function () { modal.showMulti(this); };
        showFuncCellIn.onclick = function () { modal.showCustomFunc(this); };
        delCellBtn.onclick = function () { modal.confirmDelete(this); };

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
        let tble = document.getElementById('rel_table');
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
    // Create modal
    document.addEventListener('DOMContentLoaded', function() { modal.create(); });
    
    // Find matching hostname
    var loc = location.host.replace('www.', '');
    for (let i = 0, len = sitesArray.length; i < len; i++)
        if (loc == sitesArray[i].host) cookie.check(sitesArray[i]);
})();
