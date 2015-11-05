'use strict';

var controller = require('./user.controller');

var Routes = require(global.absPath + '/app/shared/CRUD.routes');
module.exports = Routes(controller);
