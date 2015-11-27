'use strict';

var fields = ['name'];

var Item = require('./bear.model');
var Controller = require(global.absPath + '/app/shared/CRUD.controller');
module.exports = Controller(Item, fields);
