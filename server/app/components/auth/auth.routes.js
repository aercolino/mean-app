'use strict';

module.exports = Routes();

function Routes() {
    var Express = require('express');
    var router = Express.Router();
    var controller = require('./auth.controller')

    router.route('/')
        .post(controller.VerifyCredentials);

    router.route('/:token')
        .get(controller.VerifyToken);

    return router;
}
