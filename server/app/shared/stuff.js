'use strict';

var self = {
    Success: Success,
    Failure: Failure,
    SendSuccess: SendSuccess,
    SendFailure: SendFailure,
    IsPromise: IsPromise,
    Morgan: MorganFactory,
    httpStatusCode: HttpStatusCodes(),
    color: ColorFactory(),
    Apply: Apply,
    TypeOf: TypeOf,
    ArrayFind: ArrayFind,
    DefineError: DefineError
};

module.exports = self;

return;



function TypeOf(value) {
  try {
    return value.constructor.name;
  }
  catch (e) {
    return value === null ? 'Null' : typeof value;
  }
}



function ErrorMessage(error, ignoreStack) {
    var result = error && (!ignoreStack && error.stack || error.message || error.err || error) || null;
    if (result) {
        // Obfuscate paths
        result = result.replace(absPath, '(server)');
        result = result.replace(clientPath, '(client)');
    }
    return result;
}



function IsPromise(object) {
    var result = object.then && typeof object.then == 'function';
    return result;
}



function Failure(error) {
    return {
        success: false,
        message: ErrorMessage(error, true)
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


// See http://andowebsit.es/blog/noteslog.com/post/how-to-customize-morganjs/
function ColorFactory() {
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

    var anyValueFinder = result.allValues.map(function(value) {
        return value.replace(/\W/g, '\\$&');
    }).join('|');

    var anySequenceOfValues = new RegExp('(?:' + anyValueFinder + ')+(' + anyValueFinder + ')', 'g');

    var anyValue = new RegExp('(' + anyValueFinder + ')', 'g');

    function WrapUnwrapped(string, open, close, wrappedFinder) {
        var finder = '(.*?)(' + wrappedFinder + ')|(.*)';
        return String(string).replace(new RegExp(finder, 'g'), Wrap);

        function Wrap(all, unwrapped, wrapped, rest) {
            unwrapped = unwrapped || rest || '';
            wrapped = wrapped || '';
            var result = (unwrapped == '' ? '' : open + unwrapped + close) + wrapped;
            return result;
        }
    }

    function Paint(COLOR) {
        return function(string) {
            var wrappedFinder = '(?:' + anyValueFinder + ').*?' + result.DEFAULT.replace(/\W/g, '\\$&');
            var colored = WrapUnwrapped(string, COLOR, result.DEFAULT, wrappedFinder);
            var simplified = colored.replace(anySequenceOfValues, '$1');
            return simplified;
        }
    }

    result.Default = function(string) {
        var decolored = string.replace(anyValue, '');
        return decolored;
    };

    /* beautify preserve:start */
    result.White       = Paint(result.WHITE);
    result.Black       = Paint(result.BLACK);
    result.Blue        = Paint(result.BLUE);
    result.LightBlue   = Paint(result.LIGHT_BLUE);
    result.Green       = Paint(result.GREEN);
    result.LightGreen  = Paint(result.LIGHT_GREEN);
    result.Cyan        = Paint(result.CYAN);
    result.LightCyan   = Paint(result.LIGHT_CYAN);
    result.Red         = Paint(result.RED);
    result.LightRed    = Paint(result.LIGHT_RED);
    result.Purple      = Paint(result.PURPLE);
    result.LightPurple = Paint(result.LIGHT_PURPLE);
    result.Brown       = Paint(result.BROWN);
    result.Yellow      = Paint(result.YELLOW);
    result.Gray        = Paint(result.GRAY);
    result.LightGray   = Paint(result.LIGHT_GRAY);
    /* beautify preserve:end */

    return result;
}


// See http://andowebsit.es/blog/noteslog.com/post/how-to-customize-morganjs/
function MorganFactory() {
    var color = self.color;

    var Morgan = require('morgan');

    Morgan.token('current-user', function(req, res, type) {
        var result = req.currentUser ? req.currentUser.name : 'Anonymous';
        if ('colored' == type) {
            result = req.currentUser ? color.LightBlue(req.currentUser.name) : color.LightRed('Anonymous');
        }
        return result;
    });

    var DefaultStatusToken = Morgan['status'];
    Morgan.token('status', function(req, res, type) {
        var status = DefaultStatusToken(req, res);
        if ('colored' == type) {
            /* beautify preserve:start */
            var result =
                  status >= 500 ? color.Red(status)
                : status >= 400 ? color.Yellow(status)
                : status >= 300 ? color.Cyan(status)
                : status >= 200 ? color.Green(status)
                : status;
            /* beautify preserve:end */
        } else {
            result = status;
        }
        return result;
    });

    return Morgan.apply(null, arguments);
}



function RequireComponent(type, name) {
    try {
        var Pluralize = require('pluralize');
        var prefix = name.toLowerCase();
        var folder = Pluralize(prefix);
        var path = absPath + '/app/components/' + folder + '/' + prefix + '.' + type;
        var result = require(path);
    } catch (e) {
        log.error(ErrorMessage(e));
        var result = undefined;
    }
    return result;
}


// See http://stackoverflow.com/a/359910/250838
function Apply(functionName, context, args) {
    if (arguments.length == 1) {
        args = [];
        context = global;
    } else
    if (arguments.length == 2) {
        args = context;
        context = global;
    }
    log.debug('Applying ' + functionName + '(' + args[0].constructor.modelName + ':' + args[0].id + ', ' + args[1].constructor.modelName + ':' + args[1].id + ')');
    if (context === global) {
        log.debug('-- using the global context');
    } else {
        log.debug('-- using the context (start)');
        log.debug(context);
        log.debug('-- using the context (end)');
    }
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        if (i === 0 && TypeOf(context[namespaces[i]]) === 'undefined') {
            context[namespaces[i]] = RequireComponent('model', namespaces[i]);  // this could be undefined again...
        }
        context = context[namespaces[i]];
    }
    var result = context[func].apply(context, args);
    return result;
}


// See http://andowebsit.es/blog/noteslog.com/post/how-to-support-promised-predicates-in-array-find/
function ArrayFind(array, Predicate, thisArg) {
    function MyPredicate(element, index, arr) {
        return Promise.resolve(Predicate.call(thisArg, element, index, arr))
            .then(function (value) {
                return value ? element : undefined;
            });
    }
    function MyResult(element) {
        this.element = element;
    }

    return array.reduce(function(sequence, element, index, arr) {
        return sequence
            .then(function(found) {
                if (found) {
                    throw new MyResult(found);
                }
                return MyPredicate(element, index, arr);
            });
        }, Promise.resolve())
        .catch(function(reason) {
            if (reason instanceof MyResult) {
                return reason.element;
            }
            throw reason;
        });
}


// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
function DefineError(name, ParentError) {
    if (name.replace(/^[A-Za-z_]\w+$/, '') !== '') {
        throw new Error('The error name must be a valid function name.');
    }
    if (typeof ParentError !== 'function') {
        if (typeof ParentError !== 'undefined') {
            throw new Error('The error parent must be undefined (which defaults to Error) or a valid Error constructor.');
        }
        ParentError = Error;
    }

    var prefix = new RegExp('^(?:.|\\n)+\\n\\s+at new ' + name + ' .*', '');
    var Func = eval('(function ' + name + '(message) { Init.call(this, message); })');
    Func.prototype = Object.create(ParentError.prototype);
    Func.prototype.constructor = Func;
    var context = window || global;
    if (context) {
        context[name] = Func;
    }
    return;

    function Init(message) {
        this.name = name;
        this.message = message;
        this.stack = (new Error()).stack.replace(prefix, name + ': ' + message);
    }
}

