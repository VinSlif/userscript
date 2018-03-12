// Utility functions
var Util = {
    // Displays log message
    log: function (msg) {
        console.log(GM_info.script.name + ': ' + msg);
    },
    // Displays error message
    error: function (msg) {
        console.error(GM_info.script.name + ': ' + msg);
    },
    // Sets all elements of an empty array to a value
    setAll: function (arr, val) {
        for (let i = 0, n = arr.length; i < n; i++) arr[i] = val;
    },
    // Gets a random number between two(2) supplied numbers
    getRandomIntInclusive: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
    },
    // Parses a string as an HTML element
    parseHTML: function (str) {
        var tmp = document.implementation.createHTMLDocument();
        tmp.body.innerHTML = str;
        return tmp;
    }
}
