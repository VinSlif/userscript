// Utility functions
var Util = {
    // Display custom console messages
    console: {
        // Log message
        log: function (msg) {
            console.log('%c' + GM_info.script.name + ':', 'color: blue', msg);
        },
        // Error message
        error: function (msg) {
            console.error('%c' + GM_info.script.name + ':', 'color: white; background-color: red', msg);
        },
    },
    // Parses strings to formats
    parse: {
        // Parses a string as an HTML element
        getHTML: function (str) {
            var tmp = document.implementation.createHTMLDocument();
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
    }
};