'use strict';

var fields = [
    'name', 
    function (password) { 
        var Promise = require('es6-promise').Promise;
        return new Promise(function (resolve, reject) {
            var Hash = require(absPath + '/app/components/auth/hash');
            Hash({plaintext: password}, function (error, result) {
                if (error) {
                    reject(Error(error));
                } else {
                    delete result.plaintext;
                    resolve(result);
                }
            });
        });
    }, 
    function (admin) { 
        return !!admin.length; 
    }
];

var Item = require('./user.model');
var Controller = require(absPath + '/app/shared/CRUD.controller');
var self = Controller(Item, fields);
module.exports = self;


self.AllowUpdate = function (item, req) {
    return Can(req.currentUser, 'edit', item)
        .then(function (allowed) {
            if (allowed) {
                log.info('%s can edit %s %s because %s', req.currentUser.name, item.constructor.modelName, item.id, allowed.name);
            }
            return allowed;
        });
}

