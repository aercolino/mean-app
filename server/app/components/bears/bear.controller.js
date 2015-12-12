'use strict';

var fields = ['name'];

var Item = require('./bear.model');
var Controller = require(global.absPath + '/app/shared/CRUD.controller');
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
