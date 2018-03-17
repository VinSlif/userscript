// ==UserScript==
// @name         Google Image Site Exclusion
// @description  Exclude specified sites from Google search results
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      1.2.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/ExlcudeImageSite.user.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/ExlcudeImageSite.user.js
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @include      http*://*.google.tld/search?*
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @noframes
// ==/UserScript==

var settings = {
    ActiveStates: ['Off', // Turns off script
                   'Image Only', // Only excludes sites on image search
                   'All Searches'], // Always exclude sites from searches

    // Sets when exclusion should occur
    searchIndx: typeof Util.store.get('searchIndx') !== 'undefined' ? Util.store.get('searchIndx') : 1,
    searchState: '',

    // Sets which sites will be excluded
    excludedSites: typeof Util.store.get('searchSites') !== 'undefined' ? Util.store.get('searchSites').split(';') : ['pinterest.com', 'pinterest.co.uk'],

    // Populates entries with saved settings
    populate: function () {
        // Populates search behavior dropdown
        let sel = document.getElementsByName('exclusionBehavior')[0];
        for (let i = 0, len = settings.ActiveStates.length; i < len; i++) {
            let opt = document.createElement('OPTION');
            opt.text = settings.ActiveStates[i];
            sel.add(opt);
        }
        sel.value = this.searchState;

        // Populates list of saved sites
        for (let i = 0, len = this.excludedSites.length; i < len; i++) {
            modal.addTableRow(this.excludedSites[i]);
        }
    },

    // Gets selected dropdown value
    getDropVal: function () {
        settings.searchState = this.value;
        settings.searchIndx = settings.ActiveStates.indexOf(settings.searchState);
        Util.store.set('searchIndx', settings.searchIndx);
        googleSearch.doSettingsCheck();
    },

    // Adds a new site to excluded sites list
    getNewSite: function (site) {
        settings.excludedSites[Util.child.getIndex(modal.getGroup(site)) - 1] = site.value;
        Util.store.set('searchSites', settings.excludedSites.join(';'));
        googleSearch.doSettingsCheck();
    },
};

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
        ['#exclusionModal',
         ['right', '1%'], ['top', '1%'], ['width', '40%'], ['height', '98%'], ['overflow-x', 'hidden'], ['background-color', 'white'], ['position', 'fixed'], ['right', '1%'], ['z-index', '999999999999999999999999999999999999999'], ['border', '0.2em solid black'], ['display', 'none']],
        ['#exclusionModal *',
         ['font', '12px/normal Helvetica, "Trebuchet MS", Verdana, sans-serif'], ['all', 'revert']],
        // headers
        ['#exclusionModal > h1',
         ['margin', '1% auto'], ['text-align', 'center'], ['font-size', '2em'], ['font-weight', 'bold']],
        ['#exclusionModal > h2',
         ['margin', '1% auto'], ['position', 'relative'], ['text-align', 'center'], ['font-size', '1.25em'], ['font-weight', 'normal']],
        // table
        ['#exclusionTable',
         ['width', '96%'], ['margin', '0 auto 0.5em auto'], ['text-align', 'center'], ['border-collapse', 'collapse'], ['border-spacing', '2px']],
        ['#exclusionTable > tbody > tr > th',
         ['text-align', 'center'], ['border-bottom', '2px solid black']],
        ['.exclusionTableRow:nth-child(odd)',
         ['background-color', 'rgb(150, 150, 150)']],
        // table cells
        ['.exclusionInfo > td',
         ['margin', '0 auto']],
        ['.exclusionInfo > td > *',
         ['width', '98%']],
        // Add info button
        ['#exclusionAddSite',
         ['height', '2em'], ['margin-left', '1em']],
        ['#exclusionAddSite > p',
         ['margin', '0 auto']],
    ],

    // Modal HTML string
    exclusionModalStr: '<h1>Exclusion Settings</h1>' +
        '<h2>Behavior</h2>' +
        '<select name="exclusionBehavior"></select>' +
        '<h2>Site List</h2>' +
        '<table id="exclusionTable"><tbody><tr>' +
        '<th width="94%">Site</th>' +
        '<th width="6%">-</th>' +
        '</tr></tbody></table>' +
        '<button id="exclusionAddSite" type="button"><p>Add Exclusion</p></button>',

    // Used to inject the modal + functionality into the page
    create: function () {
        // Checks if modal has already been created
        if (!modal.created) {
            // Adds own css rules
            Util.stylesheet.addStylesheetRules(modal.tableCss);

            // Crates the modal div
            let modDiv = document.createElement('DIV');
            modDiv.id = 'exclusionModal';
            modDiv.innerHTML = modal.exclusionModalStr;

            // Puts modal into document
            document.body.insertBefore(modDiv, document.body.firstElementChild);

            // Sets script reference
            modal.el = document.getElementById('exclusionModal');

            // Adds saved settings
            settings.populate();

            // Add event listeners
            document.getElementsByName('exclusionBehavior')[0].addEventListener('change', settings.getDropVal);

            document.getElementById('exclusionAddSite').addEventListener('click', function () {
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

    confirmDelete: function (el) {
        if (confirm('Delete Entry?')) {
            let row = modal.getGroup(el);
            
            // Remove from storage
            settings.excludedSites.splice(Util.child.getIndex(row) - 1, 1);
            Util.store.set('searchSites', settings.excludedSites.join(';'));

            // Remove row
            row.parentNode.removeChild(row);
            googleSearch.doSettingsCheck();
        }
    },

    addTableRow: function (site = null) {
        // group itself
        var tbdy = document.createElement('TBODY'),
            // main row
            row = document.createElement('TR'),
            // site cell
            siteCell = document.createElement('TD'),
            siteCellIn = document.createElement('INPUT'),
            // delete row cell
            delCell = document.createElement('TD'),
            delCellBtn = document.createElement('BUTTON'),
            delCellBtnP = document.createElement('P'),
            // spacer row
            spcer = document.createElement('TR'),
            spcerCell = document.createElement('TD');


        // set class names
        siteCellIn.className = 'exclusionInfoSite';
        row.className = 'exclusionInfo';
        tbdy.className = 'exclusionTableRow';

        // set border style
        spcerCell.style = 'height: 0.2em';

        // set styles
        delCellBtn.style = 'margin: 0 auto';
        delCellBtnP.style = 'margin: 0';

        // set colSpans
        spcerCell.colSpan = '2';

        // set input types
        siteCellIn.type = 'text';
        delCellBtn.type = 'button';

        // set input values
        siteCellIn.placeholder = 'example.com';
        delCellBtnP.innerHTML = '-';
        siteCellIn.value = site;

        // set onclicks
        siteCellIn.addEventListener('focusout', function () {
            settings.getNewSite(this);
        });
        delCellBtn.onclick = function () {
            modal.confirmDelete(this);
        };

        // set tab index
        delCellBtn.tabIndex = '-1';

        // append spacer row
        spcer.appendChild(spcerCell);
        tbdy.appendChild(spcer);
        // append site cell
        siteCell.appendChild(siteCellIn);
        row.appendChild(siteCell);
        // append delete cell
        delCellBtn.appendChild(delCellBtnP);
        delCell.appendChild(delCellBtn);
        row.appendChild(delCell);
        tbdy.appendChild(row);
        // append spacer row
        tbdy.appendChild(spcer.cloneNode(true));
        // append table group to table
        let tble = document.getElementById('exclusionTable');
        tble.appendChild(tbdy);
    },

    // Gets row of element
    getGroup: function (el) {
        while (el.className != 'exclusionTableRow') {
            el = el.parentElement;
        }
        return el;
    }
};

var googleSearch = {
    // Gets google search form
    searchForm: document.getElementById('lst-ib'),
    // Site search exclusion modifier
    siteMod: '-site:',

    // Checks which how modifiers should be handled
    doSettingsCheck() {
        // Checks if exclusion is on
        if (settings.searchState != settings.ActiveStates[0])
            // Checks if current search is an Image search
            if (window.location.href.indexOf('tbm=isch') !== -1) this.addSiteExclusion();
            else {
                // Checks if exclusion is only applied to Image searches
                if (settings.searchState == settings.ActiveStates[1]) this.removeSiteExclusion();
                // Checks if exlcusion is applied to all searches
                else if (settings.searchState == settings.ActiveStates[2]) this.addSiteExclusion();
                // Throw error if unmatched search state
                else Util.console.error(GM_info.script.name + ': var searchState reached edge case exception');
            }
    },

    // Adds the site exclusion modifier
    addSiteExclusion: function () {
        if (this.searchForm) {
            // Checks if form has changed
            let valChanged = false,
                exclSite = '';

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = settings.excludedSites.length; i < len; i++) {
                exclSite = this.siteMod + settings.excludedSites[i];

                // Checks if google search form has site exclusion
                if (this.searchForm.value.indexOf(exclSite) === -1) {
                    // Adds site exclusion to form
                    this.searchForm.value += ' ' + exclSite;
                    valChanged = true;
                }
            }

            // Adds site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        } else Util.console.error('Search Form not found');
    },

    // Removes the site site exclusion modifier
    removeSiteExclusion: function () {
        if (this.searchForm) {
            // Checks if form has changed
            let valChanged = false,
                exclSite = '';

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = settings.excludedSites.length; i < len; i++) {
                exclSite = this.siteMod + settings.excludedSites[i];

                // Checks if google search form does not have site exclusion
                if (this.searchForm.value.indexOf(exclSite) !== -1) {
                    // Removes site exclusion from form
                    this.searchForm.value = this.searchForm.value.replace(exclSite, '');
                    valChanged = true;
                }
            }

            // Removes site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        } else Util.console.error('Search Form not found');
    },

    // Clicks Google search button
    clickGoogleSearchButton: function () {
        document.getElementsByName('btnG')[0].click();
    }
};

(function () {
    'use strict';

    // Create modal toggle
    GM_registerMenuCommand(GM_info.script.name + ': toggle settings modal', function () {
        modal.doShow = !modal.doShow;
        if (modal.doShow) modal.show();
        else modal.hide();
    });
    // Create modal
    Util.event.onDocumentReady(modal.create);

    // Sets the search state, cannot be declared in object
    settings.searchState = settings.ActiveStates[settings.searchIndx];

    // Apply settings to current search
    googleSearch.doSettingsCheck();
})();
