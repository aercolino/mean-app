'use strict';

module.exports = Routes();

function Routes() {
    var Express = require('express');
    var router = Express.Router();
    var controller = require('./auth.controller')

    router.route('/login')
        .post(controller.VerifyCredentials);

    router.route('/verify/:token')
        .get(controller.VerifyToken);

    return router;
}
