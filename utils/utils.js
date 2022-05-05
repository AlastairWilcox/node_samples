
/**
 * Created by awilcox on 07/01/2015.
 */

var path = require('path');
var fs = require('fs');
var json2mongo = require('json2mongo');

/*var forEach = function( array, func ) {
    for(var i = 0; i < array.length; i++) func(array[i]);
};

var map = function( array, func ) {
    var out = [];
    for(var i = 0; i < array.length; i++) out.push(func(array[i]));
    return out;
};
*/

var filter = function(array, func) {
    var out = [];
    for(var i = 0; i < array.length; i++) {
        if(func(array[i]) === true) {
            out.push(array[i]);
        }
    }
    return out;
};

module.exports = {
    /**
     *
     * @param name
     * @returns {*}
     */
    normalise: function(name) {
        var out = "";
        for( var i = 0; i < name.length; i++) {
            var c = name[i];

            if( c === ' ') {
                out += '-';
            } else if (c === '-') {
                out += '-';
            } else if ( c === '_') {
                //ignore
            } else if (c === '%') {
                //ignore
            } else if (c === '!') {
                //ignore
            } else if (c === '"') {
                //ignore
            } else if (c === "'") {
                //ignore
            } else if (c === '£') {
                //ignore
            } else if (c === '$') {
                //ignore
            } else if (c === '%') {
                //ignore
            } else if (c === '^') {
                //ignore
            } else if (c === '&') {
                //ignore
            } else if (c === '*') {
                //ignore
            } else if (c === '(') {
                //ignore
            } else if (c === ')') {
                //ignore
            } else if(c === '#') {
                //ignore
            } else if(c === '@') {
                //ignore
            } else if (c === ';') {
                //ignore
            } else if (c === ':') {
                //ignore
            } else if (c === ',') {
                //ignore
            } else if (c === '?') {
                //ignore
            } else if (c === '/') {
                //ignore
            } else if (c === '\\') {
                //ignore
            } else if (c === '<') {
                //ignore
            } else if (c === '>') {
                //ignore
            } else if (c === '|') {
                //ignore
            } else if (c === '[') {
                //ignore
            } else if (c === ']') {
                //ignore
            } else if (c === '{') {
                //ignore
            } else if (c === '}'){
                //ignore
            } else {
               out += c;
            }
        }
        return this.removeDouble(out, '-');
    },
    /**
     *
     * @param name
     * @param char
     * @returns {string}
     */
    removeDouble : function (name, char) {
        var out = "";
        var prev = "";
        for ( var i = 0; i < name.length; i++ ) {
            var c = name[i];

            if(c === char) {
                if(prev !== char) out += c;
            } else {
                out += c;
            }
            prev = c;
        }
        return out
    },
    /**
     *
     * @param text
     * @returns {string}
     */
    removePunctuation: function (text) {
        var out = "";
        for( var i = 0; i < text.length; i++) {
            var c = text[i];
            if (c === ',') {
                //ignore
            } else if(c === '.') {
                //ignore
            } else if (c === ';') {

            } else if(c === '?') {

            } else {
                out += c;
            }
        }
        return out;
    },
    /**
     *
     * @param text
     * @param token
     * @returns {Array}
     */
    tokenize: function(text, token) {

        return filter(text.split(token), function( item ) {
            if (item.length > 0) {
                return true
            } else {
                return false;
            }
        });
    },
    /**
     *
     * @param str
     * @returns {string}
     */
    replaceHyphen: function(str) {
        var out = "";
        for( var i = 0; i < str.length; i++) {
            var c = str[i];

            if ( c === '-' ) {
                out += ' ';
            } else {
                out += c;
            }
        }
        return out;
    },
    /**
     *
     * @param array
     * @returns {Array}
     */
    replaceHyphenArray: function(array) {
        var out = [];
        for( var i = 0; i < array.length; i++) {

            out.push(this.replaceHyphen(array[i]));
        }
        return out;
    },

    /**
     *
     * @param filename
     * @param obj
     */
    writeJSONFile: function (filename, obj){
        fs.writeFile(filename, JSON.stringify(obj, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                //console.log("written file : " + filename);
            }
        });
    },
    /**
     *
     * @param url
     * @param reports
     * @returns {*}
     */
    removeReport: function(url, reports) {
       //search and get index
        var ind = -1;
        for(var i = 0; i < reports.length; i++) {
            if (url === reports[i]['path']) {
                ind = i;
                break;
            }
        }
        if(i != -1) {
            var t = reports.splice(ind, 1);
        }
        return reports ;
    },
    /**
     *
     * @param url
     * @param reports
     * @param func
     */
    getReport : function(url, reports) {
        for(var i = 0; i < reports.length; i++) {
            if (url === reports[i]['path']) {

                return reports[i];
            }
        }
    },
    /**
     * TODO: Move this to passport
     *
     * @param menu
     * @param userType
     * @returns {Array}
     */
    filterMenu : function(menu, userType, userGroups) {
        var out = [];

        for (var i = 0; i < menu.length; i++ ) {
            var acceptedTypes = menu[i]['user-types'];
            var acceptedGroups = menu[i]['user-groups'];

            if(acceptedTypes.indexOf(userType) !== -1) {
                var passed = userGroups.some(function (element) {
                    return acceptedGroups.indexOf(element) !== -1;
                });
                if (passed) out.push(menu[i]);
            }
        }
        return out;
    },
    /**
     * Take a obj test if it exists, parse to json then to bjson for mongo
     *
     * @param obj
     * @returns {*}
     */
    parseUnknown: function (obj) {
        try {

            if (typeof obj === "string" && obj !== "") {
                return json2mongo(JSON.parse(obj));
            } else if (typeof obj === "object" && obj) {
                return json2mongo(obj);
            } else {
                return null;
            }

        } catch (err) {
            console.error(err);
            return null;
        }
    },
    /**
     * Take json and convert it to CSV
     *
     * @param json
     * @returns {string}
     */
    toCSV: function (json) {
        var csv = '';
        var fields = [];
        var header = [];

        //write header
        for (var index in json[0]) {
            fields.push(index);
            header.push('"' + index + '"');
        }
        csv = header.join(', ');
        csv += '\r\n';

        for (var i = 0; i < json.length; i++) {
            var cols = [];

            for (var j = 0; j < fields.length; j++) {

                if(typeof json[i][fields[j]] !== 'undefined' ) {
                    cols.push('"' + json[i][fields[j]] + '"');
                } else {
                    cols.push('');
                }
            }
            csv += cols.join(', ');
            csv += '\r\n';
        }
        return csv;
    },
    /**
     * Clone obj and filter out keys
     *
     * @param obj
     * @param except
     * @returns {{}}
     */
    filterObj: function (obj, except) {
        var result = {};
        for (var type in obj) {
            if (except.indexOf(type) === -1) {
                result[type] = obj[type];
            }
        }

        return result;
    },
    /**
     * Test if undefined or empty then return null
     *
     * @param string
     * @returns {*}
     */
    notEmpty: function (string) {
        if (typeof string !== 'undefined' && string !== '') {
            return string;
        } else {
            return null;
        }
    }
};
