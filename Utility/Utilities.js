// Utility functions
var Util = {
    // Display custom console messages
    console: {
        // Custom console log message
        log: function (msg) {
            console.log('%c' + GM_info.script.name + ':', 'color: blue', msg);
        },
        // Custom console error message
        error: function (msg) {
            console.error('%c' + GM_info.script.name + ':', 'color: white; background-color: red', msg);
        },
    },
    // Parses strings to formats
    parse: {
        // Parses a string as an HTML document
        getHTML: function (str) {
            let tmp = document.implementation.createHTMLDocument();
            tmp.body.innerHTML = str;
            return tmp;
        },
    },
    // Math functions
    math: {
        // Gets a random number between two(2) supplied numbers
        getRandomIntInclusive: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
        },
    },
    // Value initializers
    init: {
        // Sets all elements of an empty array to a value
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
        addStylesheetRules: function (rules, doc = document) {
            // taken from
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
            var styleEl = doc.createElement('style'), styleSheet;

            // Append style element to head
            doc.head.appendChild(styleEl);

            // Grab style sheet
            styleSheet = styleEl.sheet;

            for (let i = 0, rl = rules.length; i < rl; i++) {
                var j = 1, rule = rules[i], selector = rules[i][0], propStr = '';

                // If the second argument of a rule is an array of arrays, correct our variables.
                if (Object.prototype.toString.call(rule[1][0]) === '[object Array]') {
                    rule = rule[1];
                    j = 0;
                }

                for (let pl = rule.length; j < pl; j++) {
                    var prop = rule[j];
                    propStr += prop[0] + ':' + prop[1] + (prop[2] ? ' !important' : '') + ';\n';
                }

                // Insert CSS Rule
                styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);
            }
        },
        /* Adds inline style to object
        @example
        toStyleStr({
            'background-color': 'black !important',
            'font': '0.813em monospace !important',
            'text-align': 'center',
        }, 'body');
        */
        toStyleStr: function (cssObj, element = null) {
            var stack = [], key;
            for (key in cssObj) {
                if (cssObj.hasOwnProperty(key)) stack.push(key + ':' + cssObj[key]);
            }
            if (element) return element + '{' + stack.join(';') + '}';
            else return stack.join(';');
        },
    },
    // Custom events
    event: {
        // Detects when the page has loaded, including HTML5 history states and youtube
        onDocumentReady: function (fn) {
            document.addEventListener('DOMContentLoaded', fn); // one-time early processing
            window.addEventListener('load', fn); // one-time late postprocessing 
        }
    },
    // Access GreaseMonkey or local storage, user defined
    store: {
        // Sets storage value with a key
        set: function (key, val) {
            val = JSON.stringify(val);
            if (typeof GM_setValue === 'undefined') return localStorage.setItem(key, val);
            return GM_setValue(key, val);
        },
        // Retrieves item in storage by a key
        get: function (key) {
            let res = (typeof GM_getValue === 'undefined') ? localStorage.getItem(key) : GM_getValue(key);
            try { return JSON.parse(res); }
            catch (e) { return res; }
        },
        // Deletes item in storage by a key
        del: function (key) {
            if (typeof GM_deleteValue === 'undefined') return localStorage.removeItem(key);
            return GM_deleteValue(key);
        },
    },
    // Handles objects
    object: {
        // Checks if two (2) objects or arrays are equal to each other
        isEquivalent: function (a, b) {
            // taken from
            // https://gomakethings.com/check-if-two-arrays-or-objects-are-equal-with-javascript/
            // Get the value type
            var type = Object.prototype.toString.call(a);

            // If the two objects are not the same type, return false
            if (type !== Object.prototype.toString.call(b)) return false;

            // If items are not an object or array, return false
            if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

            // Compare the length of the length of the two items
            var aLen = type === '[object Array]' ? a.length : Object.keys(a).length;
            var bLen = type === '[object Array]' ? b.length : Object.keys(b).length;
            if (aLen !== bLen) return false;

            // Compare two items
            var compare = function (item1, item2) {
                // Get the object type
                var itemType = Object.prototype.toString.call(item1);

                // If an object or array, compare recursively
                if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                    if (!Util.object.isEquivalent(item1, item2)) return false;
                } else { // Otherwise, do a simple comparison
                    // If the two items are not the same type, return false
                    if (itemType !== Object.prototype.toString.call(item2)) return false;

                    // Else if it's a function, convert to a string and compare
                    // Otherwise, just compare
                    if (itemType === '[object Function]') {
                        if (item1.toString() !== item2.toString()) return false;
                    } else {
                        if (item1 !== item2) return false;
                    }
                }
            };

            // Compare properties
            if (type === '[object Array]') {
                for (var i = 0; i < aLen; i++) {
                    if (compare(a[i], b[i]) === false) return false;
                }
            } else {
                for (var key in a) {
                    if (a.hasOwnProperty(key)) {
                        if (compare(a[key], b[key]) === false) return false;
                    }
                }
            }

            // If nothing failed, return true
            return true;
        }
    },
    // Handles arrays
    array: {
        // Checks if all values are the same
        allValuesSame: function (a, b = undefined) {
            for (let i = 0, len = a.length; i < len; i++)
                if (a[i] !== (typeof b !== 'undefined' ? b : a[0])) return false;
            return true;
        },
        // Gets the number of matches in arrays
        getNumMatches: function (a, b) {
            let bLen = b.length,
                cnt = 0;
            for (let i = 0, len = a.length; i < len; i++)
                for (let j = 0; j < bLen; j++)
                    if (a[i] == b[j]) cnt++;
            return cnt;
        },
        // Returns the index of given child node
        getChildIndex: function (node) {
            let children = node.parentNode.childNodes, num = 0;
            for (let i = 0, len = children.length; i < len; i++) {
                if (children[i] == node) return num;
                if (children[i].nodeType == 1) num++;
            }
            return -1;
        },
        // Moves an index of an array to a new index
        moveNode: function (arr, oldIndx, newIndx) {
            // Taken from
            // https://stackoverflow.com/a/5306832
            while (oldIndx < 0) oldIndx += arr.length;
            while (newIndx < 0) newIndx += arr.length;
            
            if (newIndx >= arr.length) {
                var k = newIndx - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(newIndx, 0, arr.splice(oldIndx, 1)[0]);
        },
    }
};
