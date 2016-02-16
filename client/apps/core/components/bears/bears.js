// bears.js

(function() {
    'use strict';

    MyProject.codeSetup({
        type: 'controller',
        name: 'bearsController',
        dependencies: ['$scope'],
        services: ['/bearsService', '/usersService', 'flashService'],
        code: main
    });

    function main(my) {
        
        my.$scope.bears = [];
        my.bearsService.List(function (response) {
            if (response.error) {
                return my.flashService.error(response.error);
            }
            my.$scope.bears = response.payload;
            mergeData();
        });

        my.$scope.users = [];
        my.usersService.List(function (response) {
            if (response.error) {
                return my.flashService.error(response.error);
            }
            my.$scope.users = response.payload;
            mergeData();
        });

        function mergeData() {
            if (! (my.$scope.bears.length && my.$scope.users.length)) {
                return;
            }
            _.forEach(my.$scope.bears, function (value, key) {
                var user = _.find(my.$scope.users, {name: value.name});
                if (! user) {
                    return;
                }
                value.roles = user.roles;
            });
        }

    }

})();
