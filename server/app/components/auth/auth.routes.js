
module.exports = Routes();

function Routes() {
    var express = require('express');
    var router = express.Router();
    var controller = require('./auth.controller')

    router.route('/login')
        .post(controller.authenticateCredentials);

    router.route('/verify/:token')
        .get(controller.verifyToken);

    return router;
}

