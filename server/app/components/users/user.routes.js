'use strict';

var controller = require('./user.controller');

var Routes = require(absPath + '/app/shared/CRUD.routes');
module.exports = Routes(controller);
