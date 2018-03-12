// ==UserScript==
// @name         Google Image Site Exclusion
// @namespace    na
// @version      1.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @description  Exclude specified sites from Google search results
// @author       VinSlif
// @match        http*://*.google.tld/*
// @require      https://raw.githubusercontent.com/VinSlif/userscript/master/Utility/Utilities.js
// @grant        none
// ==/UserScript==

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
            let valChanged = false;

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = ExcludedSites.length; i < len; i++) {
                // Checks if google search form has site exclusion
                if (this.searchForm.value.indexOf(this.siteMod + ExcludedSites[i]) === -1) {
                    // Adds site exclusion to form
                    this.searchForm.value += ' ' + this.siteMod + ExcludedSites[i];
                    valChanged = true;
                }
            }

            // Adds site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        } else Util.error('searchForm not found');
    },

    // Removes the site site exclusion modifier
    removeSiteExclusion: function () {
        if (this.searchForm) {
            // Checks if form has changed
            let valChanged = false;

            // Goes through all excluded sites to remove from search results
            for (let i = 0, len = ExcludedSites.length; i < len; i++) {
                // Checks if google search form does not have site exclusion
                if (this.searchForm.value.indexOf(this.siteMod + ExcludedSites[i]) !== -1) {
                    // Removes site exclusion from form
                    this.searchForm.value = this.searchForm.value.replace(this.siteMod + ExcludedSites[i], '');
                    valChanged = true;
                }
            }

            // Removes site exclusion
            if (valChanged) this.clickGoogleSearchButton();
        } else Util.error('searchForm not found');
    },

    // Clicks Google search button
    clickGoogleSearchButton: function () {
        document.getElementsByName('btnG')[0].click();
    }
};

(function () {
    'use strict';

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
                else Util.error(GM_info.script.name + ': var searchState reached edge case exception');
            }
    } else Util.error('var searchState is out of bounds');
})();