'use strict';

var fields = [
    'name', 
    function (password) { 
        var Promise = require('es6-promise').Promise;
        return new Promise(function (resolve, reject) {
            var Hash = require(global.absPath + '/app/components/auth/hash');
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
var Controller = require(global.absPath + '/app/shared/CRUD.controller');
module.exports = Controller(Item, fields);
