// ==UserScript==
// @name         Google Image Site Exclusion
// @description  Exclude specified sites from Google search results
// @author       VinSlif
// @namespace    https://github.com/VinSlif/userscript
// @version      1.1.0
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

/*
making options menu
https://stackoverflow.com/questions/14594346/create-a-config-or-options-page-for-a-greasemonkey-script
*/

/*
 * USER SETTINGS
 * SET SCRIPT BEHAVIORS
 */
const ActiveStates = ['Off', // Turns off script
                      'Image Only', // Only excludes sites on image search
                      'All Searches']; // Always exclude sites from searches

//* SET INTENDED BEHAVIOR WITH THIS SELECTOR *//
// Sets when exclusion should occur
var searchState = ActiveStates[1];

//* SET WHICH SITES TO EXCLUDE *//
const ExcludedSites = ['pinterest.com',
                      'pinterest.co.uk'];


var googleSearch = {
    // Gets google search form
    searchForm: document.getElementById('lst-ib'),
    // Site search exclusion modifier
    siteMod: '-site:',

    // Adds the site exclusion modifier
    addSiteExclusion: function () {
        if (this.searchForm) {
            // Checks if form has changed
            let valChanged = false,
                exclSite = '';

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = ExcludedSites.length; i < len; i++) {
                exclSite = this.siteMod + ExcludedSites[i];

                // Checks if google search form has site exclusion
                if (this.searchForm.value.indexOf(exclSite) === -1) {
                    // Adds site exclusion to form
                    this.searchForm.value += ' ' + exclSite;
                    valChanged = true;
                }
            }

            // Adds site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        }
    },

    // Removes the site site exclusion modifier
    removeSiteExclusion: function () {
        if (this.searchForm) {
            // Checks if form has changed
            let valChanged = false,
                exclSite = '';

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = ExcludedSites.length; i < len; i++) {
                exclSite = this.siteMod + ExcludedSites[i];

                // Checks if google search form does not have site exclusion
                if (this.searchForm.value.indexOf(exclSite) !== -1) {
                    // Removes site exclusion from form
                    this.searchForm.value = this.searchForm.value.replace(exclSite, '');
                    valChanged = true;
                }
            }

            // Removes site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        }
    },

    // Clicks Google search button
    clickGoogleSearchButton: function () {
        document.getElementsByName('btnG')[0].click();
    }
};

var modal = {
    el: null,
    doShow: false,
    created: false

};


(function () {
    'use strict';

    GM_registerMenuCommand(GM_info.script.name + ': toggle settings modal', function () {
        modal.doShow = !modal.doShow;
        console.log(modal.doShow);
    });

    // Checks if searchState is within bounds
    if (ActiveStates.indexOf(searchState) !== -1) {
        // Checks if exclusion is on
        if (searchState != ActiveStates[0])
            // Checks if current search is an Image search
            if (window.location.href.indexOf('tbm=isch') !== -1) googleSearch.addSiteExclusion();
            else {
                // Checks if exclusion is only applied to Image searches
                if (searchState == ActiveStates[1]) googleSearch.removeSiteExclusion();
                // Checks if exlcusion is applied to all searches
                else if (searchState == ActiveStates[2]) googleSearch.addSiteExclusion();
                // Throw error if unmatched search state
                else Util.console.error(GM_info.script.name + ': var searchState reached edge case exception');
            }
    } else Util.console.error('var searchState is out of bounds');
})();
