'use strict';

module.exports = {
    Success: Success,
    Failure: Failure,
    IsPromise: IsPromise,
    httpStatusCode: HttpStatusCodes()
};

return;



function IsPromise(object) {
    var result = object.then && typeof object.then == 'function';
    return result;
}



function Failure(err) {
    return {
        success: false,
        message: typeof err == 'string' ? err : (err.err || err.message || err || null)
    };
}



function Success(payload, message) {
    return {
        success: true,
        payload: payload,
        message: message
    };
}



function HttpStatusCodes() {
    var http = require('http');
    var result = {};
    Object.keys(http.STATUS_CODES).map(function(code) {result[http.STATUS_CODES[code]] = code;})
    return result;
}



