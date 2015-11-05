module.exports = CRUD_Routes;

function CRUD_Routes(controller) {
    var express = require('express');
    var router = express.Router();

    var auth = require(global.absPath + '/app/components/auth/auth.controller');
    // All routes after this "use" are restricted.
    router.use(auth.verifyToken);

    router.route('/')
        .get(controller.list)
        .post(controller.create);

    router.route('/:item_id')
        .get(controller.read)
        .put(controller.update)
        .delete(controller.delete);

    return router;
}
