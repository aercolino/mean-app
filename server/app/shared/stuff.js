'use strict';

var self = {
    Success: Success,
    Failure: Failure,
    SendSuccess: SendSuccess,
    SendFailure: SendFailure,
    IsPromise: IsPromise,
    httpStatusCode: HttpStatusCodes()
};

module.exports = self;

return;



function IsPromise(object) {
    var result = object.then && typeof object.then == 'function';
    return result;
}



function Failure(error) {
    return {
        success: false,
        message: typeof error == 'string' ? error : (error.err || error.message || error || null)
    };
}



function Success(payload, message) {
    return {
        success: true,
        payload: payload,
        message: message
    };
}



function SendFailure(response, error, status) {
    var code = /^\d+$/.test(status) ? status : self.httpStatusCode[status];
    response.status(code || 500).json(self.Failure(error));
}



function SendSuccess(response, payload, message, status) {
    var code = /^\d+$/.test(status) ? status : self.httpStatusCode[status];
    response.status(code || 200).json(self.Success(payload, message));
}



function HttpStatusCodes() {
    var http = require('http');
    var result = {};
    Object.keys(http.STATUS_CODES).map(function(code) {result[http.STATUS_CODES[code]] = code;})
    return result;
}



