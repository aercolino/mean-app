'use strict';

var controller = require('./role.controller');

var Routes = require(global.absPath + '/app/shared/CRUD.routes');
module.exports = Routes(controller);
