// ==UserScript==
// @name         Dismiss Reddit Sign In Pop-up
// @namespace    na
// @version      1.0
// @downloadURL  https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @updateURL    https://raw.githubusercontent.com/VinSlif/userscript/master/GreaseMonkey/DismissRedditSignIn.js
// @description  Removes the Reddit sign in pop-up on the Reddit main page
// @author       VinSlif
// @match        https://*.reddit.com/
// @grant        none
// @noframes
// ==/UserScript==

// Adds remove functionality for elements
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};


(function () {
    'use strict';
    
    // Checks for the pop up message
    let popUp = document.getElementById('onboarding-splash');
    if (popUp !== null) {
        // Remove pop up
        popUp.remove();

        // Checks for modal restricting scrolling
        var scrollControl = setInterval(function () {
            if (document.body.classList.contains('modal-open')) {
                // Returns scrolling behavior
                document.body.classList.remove('modal-open');
                clearInterval(scrollControl);
                scrollControl = null;
            }
        }, 100);
    }

})();
