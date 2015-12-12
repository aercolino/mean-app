'use strict';

module.exports = CRUD_Routes;

function CRUD_Routes(controller) {
    var Express = require('express');
    var router = Express.Router();

    if (skipAuth) {
        console.log('Skipping authentication...');
    } else {
        var auth = require(absPath + '/app/components/auth/auth.controller');
        router.use(auth.VerifyToken);  // All routes after this line are authenticated.
    }

    router.route('/')
        .get(controller.List)
        .post(controller.Create);

    router.route('/:item_id')
        .get(controller.Read)
        .put(controller.Update)
        .delete(controller.Delete);

    return router;
}
