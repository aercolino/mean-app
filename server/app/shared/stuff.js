'use strict';

module.exports = {
    IsPromise: IsPromise
};

return;

function IsPromise(object) {
    var result = object.then && typeof object.then == 'function';
    return result;
}

