// ==UserScript==
// @name         Cookie Controller
// @description  Adds customized cookies to websites
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      0.4.0
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

var settings = {
    // Saved settings values
    saved: [],

    // Converts and saves settings to storage
    encode: function () {
        let toSaveStr = '';
        for (let i = 0, len = this.saved.length; i < len; i++) {
            let saveStr = '';
            saveStr += this.saved[i].site + '@' +
                this.saved[i].cName + '@' + (this.saved[i].cVal) + '@' +
                (this.saved[i].mlti !== null ? '["' + (this.saved[i].mlti[0] || null) + '","' + (this.saved[i].mlti[1] || null) + '"]' : null) + '@' +
                (this.saved[i].cstmFn || null);
            toSaveStr += saveStr + '@@';
        }
        console.log(toSaveStr);
        Util.store.set('ckieCntlr', toSaveStr);
    },

    // Gets and converts settings from storage
    decode: function () {
        // Gets stored settings/sets example default values
        let stored = typeof Util.store.get('ckieCntlr') !== 'undefined' && Util.store.get('ckieCntlr') !== null ? Util.store.get('ckieCntlr') : 'youtube.com@PREF@f6=40008&f5=30030@["=","&"]@null@@' +
            'reddit.com@over18@1@null@if(-1!==location.pathname.indexOf("over18")){let a=location.href;document.location=decodeURIComponent(a.substr(a.indexOf("?dest=")+6))}else document.location.reload();@@',
            savedStr = stored.split('@@'); // Splits strings into individual entries

        // Send settings to stored information to parse on site
        for (let i = 0, len = savedStr.length - 1; i < len; i++) {
            let entry = savedStr[i].split('@'),
                hasCk = false;
            for (let j = 0, lenj = this.saved.length; j < lenj; j++)
                if (this.saved[j].cName == entry[1]) hasCk = true;
            if (!hasCk) this.saved.push(new this.cookieObj(entry[0], entry[1], entry[2], entry[3], entry[4]));
        }
        console.log(this.saved);
    },

    // Populates entries with saved settings
    populate: function () {
        for (let i = 0, len = this.saved.length; i < len; i++) {
            modal.addTableRow(this.saved[i].site, this.saved[i].cName, this.saved[i].cVal,
                (this.saved[i].mlti || [null, null]), this.saved[i].cstmFn);
        }
    },

    // Adds cookies to storage / Edits cookies in storage
    addNewCookie(site, cName, cVal, mlti, cstmFn) {
        let newEntry = new this.cookieObj(site, cName, cVal, (!Util.array.allValuesSame(mlti, null) ? mlti : 'null'), cstmFn);

        // Searches for match
        for (let i = 0, len = this.saved.length; i < len; i++) {
            if (this.saved[i].site == newEntry.site && this.saved[i].cName == newEntry.cName) {
                // Overwrites if not equal
                if (!Util.object.isEquivalent(this.saved[i], newEntry)) {
                    this.saved[i] = newEntry;
                    this.encode();
                }
                return;
            }
        }
        this.saved.push(newEntry);
        this.encode();
    },

    // Removes deleted entry from saved
    delSaved: function (delSt, delCk) {
        // Check if values have been filled
        if (delSt == '' || delCk == '') return;

        // Check all saved cookie names
        for (let i = 0, len = this.saved.length; i < len; i++) {
            if (this.saved[i].cName == delCk && this.saved[i].site == delSt) {
                this.saved.splice(i, 1); // Remove saved
                this.encode(); // Save Changes
                break;
            }
        }
    },

    // Cookie settings object constructor
    cookieObj: function (site, cName, cVal, mlti, cstmFn) {
        this.site = site; this.cName = cName;
        this.cVal = (cVal != 'null' ? cVal : null);
        this.mlti = eval(mlti);
        this.cstmFn = cstmFn != 'null' ? cstmFn : null;
    },
};

var modal = {
    el: null, // Reference modal element
    doShow: false, // Track display state
    created: false, // Modal created token

    // Custom css to be injected into the page
    tableCss: [
        // Normalize
        // Div
        ['#cookieModal',
         ['right', '1%'], ['top', '1%'], ['width', '40%'], ['height', '98%'], ['overflow-x', 'auto'], ['background-color', 'white'], ['position', 'fixed'], ['right', '1%'], ['z-index', '999999999999999999999999999999999999999'], ['border', '0.2em solid black'], ['display', 'none']],
        ['#cookieModal *',
         ['font', '12px/normal Helvetica, "Trebuchet MS", Verdana, sans-serif'], ['all', 'revert']],
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
        ['.cookiecustomFnc > td > textarea',
         ['width', '100%'], ['padding', '0'], ['overflow-y', 'auto'], ['resize', 'none']],
        // Add info button
        ['#cookieAddInfo',
         ['height', '2em'], ['margin-left', '1em']],
        ['#cookieAddInfo > p',
         ['margin', '0 auto']],
        ['.unselectable',
         ['-webkit-user-select', 'none'], ['-moz-user-select', 'none']],
    ],

    // Modal HTML string
    cookieModalStr: '<h1 class="unselectable">Cookie Controller</h1>' +
        '<table id="cookieTable"><tbody class="unselectable"><tr>' +
        '<th style="width: 40%">Site</th>' +
        '<th style="width: 15%">Cookie</th>' +
        '<th style="width: 15%">Value</th>' +
        '<th style="width: 10%">mult</th>' +
        '<th style="width: 10%">fn</th>' +
        '<th style="width: 10%">-</th>' +
        '</tr></tbody></table>' +
        '<button id="cookieAddInfo" type="button"><p class="unselectable">Add Cookie</p></button>',

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
            let unsel = modal.el.getElementsByClassName('unselectable');
            for (let i = 0, len = unsel.length; i < len; i++) unsel[i].onselectstart = function () { return false; };

            // Adds click event listener
            document.getElementById('cookieAddInfo').addEventListener('click', function () { modal.addTableRow(); });

            // Fills entries from saved settings
            settings.populate();

            // Adds debug hide key (? key)
            document.addEventListener('keypress', function (e) { if (e.keyCode == 47) modal.toggle(); });

            // Sets check token
            modal.created = true;
        }
    },

    // Toggle modal display
    toggle: function () {
        if (this.el) {
            this.doShow = !this.doShow;
            if (this.doShow) this.el.style.display = 'block';
            else this.el.style.display = 'none';
        }
    },

    // Returns row of an element
    getGroup: function (el) {
        while (el.className != 'cookieTableRow') el = el.parentElement;
        return el;
    },

    // Confirm row deletion
    confirmDelete: function (el) {
        let row = modal.getGroup(el),
            cSite = row.querySelector('.cookieInfoSite').value,
            cName = row.querySelector('.cookieInfoName').value;

        if ((cSite == '' && cName == '') || confirm('Delete Entry?')) {
            settings.delSaved(cSite, cName);
            row.parentNode.removeChild(row);
        }
    },

    // Show the assignment and delimiter row
    showMulti: function (el) {
        let row = modal.getGroup(el).querySelector('.cookieMultiVal');
        row.style.display = el.checked ? 'table-row' : 'none';
    },

    // Show custom function textbox
    showcustomFnc: function (el) {
        let row = modal.getGroup(el).querySelector('.cookiecustomFnc');
        row.style.display = el.checked ? 'table-row' : 'none';
    },

    // Checks if all major values for an entry have been filled
    checkAllValuesFilled: function (el) {
        // Checks values of main parts are filled
        let infRow = modal.getGroup(el),
            infSite = infRow.querySelector('.cookieInfoSite'),
            infCName = infRow.querySelector('.cookieInfoName');

        if (infSite.value !== '' && infCName.value !== '') {
            // Gets the rest of the values
            let infCVal = infRow.querySelector('.cookieInfoValue'),
                mltiRow = infRow.querySelector('.cookieMultiVal'),
                fnRow = infRow.querySelector('.cookiecustomFnc');

            // Pushes values to be checked against stored values
            settings.addNewCookie(infSite.value, infCName.value, (infCVal.value != '' ? infCVal.value : null),
                [mltiRow.children[0].firstElementChild.value || null, mltiRow.children[1].firstElementChild.value || null],
                fnRow.firstElementChild.firstElementChild.value || 'null');
        }
    },

    // Adds entry row to the list of cookie settings
    addTableRow: function (site = null, cookieName = null, cookieVal = null, mltiVal = [null, null], customFn = null) {
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
            showfnCell = document.createElement('TD'),
            showfnCellIn = document.createElement('INPUT'),
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
            fnRow = document.createElement('TR'),
            fnRowCell = document.createElement('TD'),
            fnRowIn = document.createElement('TEXTAREA'),
            // spacer row
            spcer = document.createElement('TR'),
            spcerCell = document.createElement('TD');


        // set class names
        siteCellIn.className = 'cookieInfoSite';
        ckNameCellIn.className = 'cookieInfoName';
        ckValCellIn.className = 'cookieInfoValue';
        showMltCellIn.className = 'cookieInfoHasMult';
        showfnCellIn.className = 'cookieInfoHasFunc';
        delCellBtnP.className = 'unselectable';
        row.className = 'cookieInfo';
        mltRow.className = 'cookieMultiVal';
        fnRow.className = 'cookiecustomFnc';
        tbdy.className = 'cookieTableRow';

        // set border style
        spcerCell.style = 'height: 0.2em';

        // set styles
        delCellBtn.style = 'margin: 0 auto;';
        delCellBtnP.style = 'margin: 0;';
        mltRow.style.display = mltiVal[0] !== null || mltiVal[1] !== null ? 'table-row' : 'none';
        fnRow.style.display = customFn !== null ? 'table-row' : 'none';
        mltRowAsgnIn.style = mltRowDelimIn.style = 'width: 98%';

        // set colSpans
        fnRowCell.colSpan = spcerCell.colSpan = '6';
        mltRowAsgnCell.colSpan = '2';
        mltRowDelimCell.colSpan = '4';
        fnRowIn.rows = '4';

        // set input types
        siteCellIn.type = ckNameCellIn.type = ckValCellIn.type = mltRowAsgnIn.type = mltRowDelimIn.type = 'text';
        showMltCellIn.type = showfnCellIn.type = 'checkbox';
        delCellBtn.type = 'button';

        // set displays
        siteCellIn.placeholder = 'example.com';
        ckNameCellIn.placeholder = 'cookieName';
        ckValCellIn.placeholder = 'val';
        delCellBtnP.innerHTML = '-';
        mltRowAsgnIn.placeholder = 'Assignment Character';
        mltRowDelimIn.placeholder = 'Delimiter Character';
        fnRowIn.placeholder = 'Custom function that will overwrite default page reload to apply the changes.\n' +
            '      *** WARNING ***\nThis can be harmful and inject unintended code.\nDo NOT use single (\') quotes';

        // set input values
        siteCellIn.value = site;
        ckNameCellIn.value = cookieName;
        ckValCellIn.value = cookieVal;
        showMltCellIn.checked = mltiVal[0] !== null || mltiVal[1] !== null;
        showfnCellIn.checked = customFn !== null;
        mltRowAsgnIn.value = mltiVal[0];
        mltRowDelimIn.value = mltiVal[1];
        fnRowIn.value = customFn;


        // set onclicks / listeners
        siteCellIn.addEventListener('focusout', function () { if (this.value != '') modal.checkAllValuesFilled(this); });
        ckNameCellIn.addEventListener('focusout', function () { if (this.value != '') modal.checkAllValuesFilled(this); });
        ckValCellIn.addEventListener('focusout', function () { modal.checkAllValuesFilled(this); });
        mltRowAsgnIn.addEventListener('focusout', function () { modal.checkAllValuesFilled(this); });
        mltRowDelimIn.addEventListener('focusout', function () { modal.checkAllValuesFilled(this); });
        fnRowIn.addEventListener('focusout', function () { modal.checkAllValuesFilled(this); });
        showMltCellIn.onclick = function () { modal.showMulti(this); };
        showfnCellIn.onclick = function () { modal.showcustomFnc(this); };
        delCellBtn.onclick = function () { modal.confirmDelete(this); };

        // append spacer row
        spcer.appendChild(spcerCell);
        tbdy.appendChild(spcer);
        // append first row
        siteCell.appendChild(siteCellIn); // append site cell
        ckNameCell.appendChild(ckNameCellIn); // append name cell
        ckValCell.appendChild(ckValCellIn); // append value cell
        showMltCell.appendChild(showMltCellIn); // append multi check cell
        showfnCell.appendChild(showfnCellIn); // append custom func check cell
        delCellBtn.appendChild(delCellBtnP); // append delete cell button text
        delCell.appendChild(delCellBtn); // append delete cell
        row.appendChild(siteCell);
        row.appendChild(ckNameCell);
        row.appendChild(ckValCell);
        row.appendChild(showMltCell);
        row.appendChild(showfnCell);
        row.appendChild(delCell);
        tbdy.appendChild(row);
        // append multi row
        mltRowAsgnCell.appendChild(mltRowAsgnIn);
        mltRow.appendChild(mltRowAsgnCell);
        mltRowDelimCell.appendChild(mltRowDelimIn);
        mltRow.appendChild(mltRowDelimCell);
        tbdy.appendChild(mltRow);
        // appen custom function row
        fnRowCell.appendChild(fnRowIn);
        fnRow.appendChild(fnRowCell);
        tbdy.appendChild(fnRow);
        // append spacer row
        tbdy.appendChild(spcer.cloneNode(true));
        // append table group to table
        let tble = document.getElementById('cookieTable');
        tble.appendChild(tbdy);

        // Adds unselectable events to each unselectable
        let unsel = tble.getElementsByClassName('unselectable');
        for (let i = 0, len = unsel.length; i < len; i++)
            if (unsel[i].onselectstart === null) unsel[i].onselectstart = function () { return false; };
    },
};

var cookie = {
    // Check what to do with cookie
    check: function (info) {
        console.log(info);
        // Check if cookie has a limiter + delimiter
        if (info.mlti === null) {

            // Check if cookie exists and is correct value
            let c = this.read(info.cName);
            if (c === null || c != (info.cVal || '')) {
                // Sets cookie
                this.setCookie(info.cName, (info.cVal || ''), info.site);
                this.tryCustomEval(info.cstmFn);
            }
        } else {
            // Check if cookie exists
            // Needs to be done because limiter + delimiter IMPLIES other values
            var checker = setInterval(function () {
                if (cookie.read(info.cName) !== null) {
                    clearInterval(checker); // Stop checking
                    cookie.editExisting(info); // Edit cookie
                }
            }, 500);
        }
    },

    // Edits an already existing cookie
    editExisting: function (info) {
        // Edits existing cookie value
        let cEdit = this.read(info.cName).split(info.mlti[1]),
            cMake = info.cVal.split(info.mlti[1]),
            cMade = [],
            cFinal = '';

        // Checks if values need to be created
        cMade.length = cMake.length;
        Util.init.setAll(cMade, false);

        // Goes through all split cookie values
        for (let i = 0, lenExist = cEdit.length; i < lenExist; i++) {
            // Splits cookie value into encoded parts
            let editSiteVal = cEdit[i].split(info.mlti[0] !== 'null' ? info.mlti[0] : null);

            // Check if split cookie value is desired cookie value to edit
            for (let j = 0, lenMake = cMake.length; j < lenMake; j++) {
                let toSetVal = cMake[j].split(info.mlti[0] !== 'null' ? info.mlti[0] : null),
                    setIndx = toSetVal.length - 1;

                // Change split value to desired value
                if (editSiteVal[0] == toSetVal[0]) {
                    if (editSiteVal[setIndx] != toSetVal[setIndx]) editSiteVal[setIndx] = toSetVal[setIndx];
                    cMade[j] = true;
                }
            }

            cEdit[i] = editSiteVal.join(info.mlti[0]);
        }

        for (let i = 0, len = cMade.length; i < len; i++)
            if (cMade[i] === false) cEdit.push(cMake[i]);

        cFinal = cEdit.join(info.mlti[1]);

        // Check if cookie value has been changed
        if (cFinal != this.read(info.cName)) {
            // Apply cookie value changes
            this.setCookie(info.cName, cFinal, info.site);
            // console.log('do custom function');
            this.tryCustomEval(info.cstmFn);
        }
    },

    // Attempts to parse the custom function
    tryCustomEval: function (str) {
        if (str !== null) {
            try { eval(str);
            } catch (err) {
                Util.console.error(err);
                //document.location.reload();
            }
        } else document.location.reload();
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
        for (let i = 0, len = ca.length; i < len; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
};


(function () {
    'use strict';

    // Gets stored settings
    settings.decode();

    // Create modal
    Util.event.onDocumentReady(modal.create);

    // Create modal toggle
    GM_registerMenuCommand(GM_info.script.name + ': toggle settings modal', function () { modal.toggle(); });

    // Check hostname
    var loc = location.host.replace('www.', '');

    // YouTube uses HTML5 history api for page loading
    if (loc == 'youtube.com') {
        // https://stackoverflow.com/a/17128566
        // https://stackoverflow.com/a/34100952
        window.addEventListener('spfdone', modal.create); // old youtube design
        window.addEventListener('yt-navigate-start', modal.create); // new youtube design
    }

    // Find matching hostname
    for (let i = 0, len = settings.saved.length; i < len; i++)
        if (loc == settings.saved[i].site) cookie.check(settings.saved[i]);
})();
