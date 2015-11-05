var Item = require('./bear.model');
var fields = ['name'];

var Controller = require(global.absPath + '/app/shared/CRUD.controller');
module.exports = Controller(Item, fields);
