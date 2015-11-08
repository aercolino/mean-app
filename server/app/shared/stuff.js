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
    Object.keys(http.STATUS_CODES).map(function(code) {
        result[http.STATUS_CODES[code]] = code;
    })
    return result;
}



function Colors() {
    var result = {};

    /* beautify preserve:start */
    result.DEFAULT      = '\x1b[0m';
    result.WHITE        = '\x1b[1;37m';
    result.BLACK        = '\x1b[0;30m';
    result.BLUE         = '\x1b[0;34m';
    result.LIGHT_BLUE   = '\x1b[1;34m';
    result.GREEN        = '\x1b[0;32m';
    result.LIGHT_GREEN  = '\x1b[1;32m';
    result.CYAN         = '\x1b[0;36m';
    result.LIGHT_CYAN   = '\x1b[1;36m';
    result.RED          = '\x1b[0;31m';
    result.LIGHT_RED    = '\x1b[1;31m';
    result.PURPLE       = '\x1b[0;35m';
    result.LIGHT_PURPLE = '\x1b[1;35m';
    result.BROWN        = '\x1b[0;33m';
    result.YELLOW       = '\x1b[1;33m';
    result.GRAY         = '\x1b[0;30m';
    result.LIGHT_GRAY   = '\x1b[0;37m';
    /* beautify preserve:end */

    // ['DEFAULT', 'WHITE', 'BLACK', ...]
    result.allNames = Object.keys(result);

    // ['\x1b[0m', '\x1b[1;37m', '\x1b[0;30m', ...]
    result.allValues = result.allNames.map(function(name) {
        return result[name];
    });

    var anyValue = result.allValues.map(function(value) {
        return value.replace(/\W/g, '\\$&');
    }).join('|');
    var anySequenceOfValues = new RegExp('(?:' + result.anyValue + ')+(' + result.anyValue + ')', 'g');
    var lastValueOfSequence = '$1';

    function paint(COLOR) {
        return function(string) {
            var colored = COLOR + string + result.DEFAULT;
            var simplified = colored.replace(anySequenceOfValues, lastValueOfSequence);
            return simplified;
        }
    }

    /* beautify preserve:start */
    result.Default     = paint(result.DEFAULT);
    result.White       = paint(result.WHITE);
    result.Black       = paint(result.BLACK);
    result.Blue        = paint(result.BLUE);
    result.LightBlue   = paint(result.LIGHT_BLUE);
    result.Green       = paint(result.GREEN);
    result.LightGreen  = paint(result.LIGHT_GREEN);
    result.Cyan        = paint(result.CYAN);
    result.LightCyan   = paint(result.LIGHT_CYAN);
    result.Red         = paint(result.RED);
    result.LightRed    = paint(result.LIGHT_RED);
    result.Purple      = paint(result.PURPLE);
    result.LightPurple = paint(result.LIGHT_PURPLE);
    result.Brown       = paint(result.BROWN);
    result.Yellow      = paint(result.YELLOW);
    result.Gray        = paint(result.GRAY);
    result.LightGray   = paint(result.LIGHT_GRAY);
    /* beautify preserve:end */

    return result;
}



function MorganFactory() {
    var color = self.color;

    var Morgan = require('morgan');

    Morgan.token('current-user', function(req, res) {
        var result = req.currentUser ? color.LightBlue(req.currentUser.name) : color.LightRed('Anonymous');
        return result;
    });

    Morgan.token('status', function(req, res) {
        var status = res._header ? res.statusCode : undefined;
        /* beautify preserve:start */
        var result =
              status >= 500 ? color.Red(status)
            : status >= 400 ? color.Yellow(status)
            : status >= 300 ? color.Cyan(status)
            : status >= 200 ? color.Green(status)
            : status;
        /* beautify preserve:end */
        return result;
    });

    return Morgan.apply(null, arguments);
}
