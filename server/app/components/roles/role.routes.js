'use strict';

var controller = require('./role.controller');

var Routes = require(absPath + '/app/shared/CRUD.routes');
module.exports = Routes(controller);
