(function () {
    'use strict';

    MyProject.codeSetup({
        type: 'factory',
        name: 'usersService',
        dependencies: [],
        services: ['crudService'],
        code: main
    });


    function main(my) {
        var self = my.crudService.Init({endpoint: '/api/users/'});
        return self;
    }

})();
