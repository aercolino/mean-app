'use strict';

var self = {
    Success: Success,
    Failure: Failure,
    SendSuccess: SendSuccess,
    SendFailure: SendFailure,
    IsPromise: IsPromise,
    Morgan: MorganFactory,
    httpStatusCode: HttpStatusCodes(),
    color: Colors()
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



function Colors() {
    var result = {};
    result.DEFAULT      = '\x1b[0m'
    result.WHITE        = '\x1b[1;37m'
    result.BLACK        = '\x1b[0;30m'
    result.BLUE         = '\x1b[0;34m'
    result.LIGHT_BLUE   = '\x1b[1;34m'
    result.GREEN        = '\x1b[0;32m'
    result.LIGHT_GREEN  = '\x1b[1;32m'
    result.CYAN         = '\x1b[0;36m'
    result.LIGHT_CYAN   = '\x1b[1;36m'
    result.RED          = '\x1b[0;31m'
    result.LIGHT_RED    = '\x1b[1;31m'
    result.PURPLE       = '\x1b[0;35m'
    result.LIGHT_PURPLE = '\x1b[1;35m'
    result.BROWN        = '\x1b[0;33m'
    result.YELLOW       = '\x1b[1;33m'
    result.GRAY         = '\x1b[0;30m'
    result.LIGHT_GRAY   = '\x1b[0;37m'
    return result;    
}



function MorganFactory(template) {
    var color = self.color;
    var Morgan = require('morgan');
    Morgan.token('current-user', function (req, res) { 
        var result = (req.currentUser 
            ? color.LIGHT_BLUE + req.currentUser.name 
            : color.LIGHT_RED  + 'Anonymous') + color.DEFAULT;
        return result; 
    });
    Morgan.token('status', function (req, res) { 
        var status = res._header ? res.statusCode : undefined;
        var COLOR = status >= 500 ? color.RED
            : status >= 400 ? color.YELLOW
            : status >= 300 ? color.CYAN
            : status >= 200 ? color.GREEN
            : color.DEFAULT;
        var result = COLOR + status + color.DEFAULT
        return result; 
    });
    return Morgan(template);
}
