(function () {
    'use strict';

    MyProject.codeSetup({
        type: 'factory',
        name: 'bearsService',
        dependencies: [],
        services: ['crudService'],
        code: main
    });


    function main(my) {
        var self = {
            List:   my.crudService.List,
            Create: my.crudService.Create,
            Read:   my.crudService.Read,
            Update: my.crudService.Update,
            Delete: my.crudService.Delete,
        };

        my.crudService.Config({endpoint: '/api/bears/'});

        return self;
    }

})();
