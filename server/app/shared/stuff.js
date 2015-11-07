'use strict';

module.exports = {
    IsPromise: IsPromise,
    httpStatusCode: HttpStatusCodes()
};

return;

function IsPromise(object) {
    var result = object.then && typeof object.then == 'function';
    return result;
}



function HttpStatusCodes() {
    var http = require('http');
    var result = {};
    Object.keys(http.STATUS_CODES).map(function(code) {result[http.STATUS_CODES[code]] = code;})
    return result;
}

