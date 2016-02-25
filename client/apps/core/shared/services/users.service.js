(function () {
    'use strict';

    MyProject.CodeSetup({
        type: 'factory',
        name: 'usersService',
        dependencies: [],
        services: ['crudService'],
        code: main
    });


    function main(my) {
        var method = 2;
        switch (method) {
            case 1:
                var self = my.crudService.Init({endpoint: '/api/user/'});
            break;

            case 2:
                var self = my.crudService.Init({endpoint: '/api/users/'});
            break;
        }
        return self;
    }

})();
