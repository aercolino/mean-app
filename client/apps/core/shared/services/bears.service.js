(function () {
    'use strict';

    MyProject.CodeSetup({
        type: 'factory',
        name: 'bearsService',
        dependencies: [],
        services: ['crudService'],
        code: main
    });


    function main(my) {
        var self = my.crudService.Init({endpoint: '/api/bears/'});
        return self;
    }

})();
