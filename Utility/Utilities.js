// Utility functions
var Util = {
    // Display custom console messages
    console: {
        /* Custom console log message
         * @param {String} message to be displayed
         */
        log: function (msg) {
            console.log('%c' + GM_info.script.name + ':', 'color: blue', msg);
        },
        /* Custom console error message
         * @param {String} message to be displayed
         */
        error: function (msg) {
            console.error('%c' + GM_info.script.name + ':', 'color: white; background-color: red', msg);
        },
    },
    // Parses strings to formats
    parse: {
        /* Parses a string as an HTML document
         * @param {String} string to convert
         */
        getHTML: function (str) {
            let tmp = document.implementation.createHTMLDocument();
            tmp.body.innerHTML = str;
            return tmp;
        },
    },
    // Math functions
    math: {
        /* Gets a random number between two(2) supplied numbers
         * @param {Int} minimum number
         * @param {Int} maximum number
         */
        getRandomIntInclusive: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
        },
    },
    // Value initializers
    init: {
        /* Sets all elements of an empty array to a value
         * @param {Array} array to set
         * @param value to set array to
         */
        setAll: function (arr, val) {
            for (let i = 0, n = arr.length; i < n; i++) arr[i] = val;
        },
    },
    // Affect css
    stylesheet: {
        /**
        * Add a stylesheet rule to the document (may be better practice, however,
        * to dynamically change classes, so style information can be kept in
        * genuine stylesheets (and avoid adding extra elements to the DOM))
        * Note that an array is needed for declarations and rules since ECMAScript does
        * not afford a predictable object iteration order and since CSS is 
        * order-dependent (i.e., it is cascading); those without need of
        * cascading rules could build a more accessor-friendly object-based API.
        * @param {Array} rules Accepts an array of JSON-encoded declarations
        * @example
        addStylesheetRules([
        ['h2', // Also accepts a second argument as an array of arrays instead
            ['color', 'red'],
            ['background-color', 'green', true] // 'true' for !important rules 
        ], ['.myClass', 
            ['background-color', 'yellow']
        ]]);
        */
        addStylesheetRules: function (rules) {
            // taken from
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
            var styleEl = document.createElement('style'),
                styleSheet;

            // Append style element to head
            document.head.appendChild(styleEl);

            // Grab style sheet
            styleSheet = styleEl.sheet;

            for (var i = 0, rl = rules.length; i < rl; i++) {
                var j = 1,
                    rule = rules[i],
                    selector = rules[i][0],
                    propStr = '';
                // If the second argument of a rule is an array of arrays, correct our variables.
                if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
                    rule = rule[1];
                    j = 0;
                }

                for (var pl = rule.length; j < pl; j++) {
                    var prop = rule[j];
                    propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
                }

                // Insert CSS Rule
                styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
            }
        },
    },
    // Custom events
    event: {
        /* Detects when the page has loaded, including HTML5 history states and youtube
         * @param {Function} function to execute when the page loads
         */
        onDocumentReady: function (fn) {
            document.addEventListener('DOMContentLoaded', fn); // one-time early processing
            window.addEventListener('load', fn); // one-time late postprocessing 
        }
    },
    // Access GreaseMonkey or local storage, user defined
    store: {
        /* Sets storage value with a key
         * @param {String} storage key
         * @param {Value} value to be stored
         */
        set: function (key, val) {
            val = JSON.stringify(val);
            if (typeof GM_setValue === 'undefined') {
                return localStorage.setItem(key, val);
            }
            return GM_setValue(key, val);
        },
        /* Retrieves item in storage by a key
         * @param {String} storage key
         */
        get: function (key) {
            var res;
            if (typeof GM_getValue === 'undefined') {
                res = localStorage.getItem(key);
            } else {
                res = GM_getValue(key);
            }
            try {
                return JSON.parse(res);
            } catch (e) {
                return res;
            }
        },
        /* Deletes item in storage by a key
         * @param {String} storage key
         */
        del: function (key) {
            if (typeof GM_deleteValue === 'undefined') {
                return localStorage.removeItem(key);
            }
            return GM_deleteValue(key);
        },

    },
};
