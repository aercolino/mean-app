// bears.js

(function() {
    'use strict';

    MyProject.CodeSetup({
        type: 'controller',
        name: 'bearsController',
        dependencies: ['$scope'],
        services: ['/bearsService', '/usersService', 'flashService'],
        code: main
    });

    function main(my) {
        
        var bears = my.$scope.bears = [];
        var users = [];

        var method = 3;
        switch (method) {
            case 1:
                my.bearsService.List(function (response) {
                    if (response.error) {
                        return my.flashService.error(response.error);
                    }
                    bears = response.payload;
                    setScopeBears();
                });
                
                my.usersService.List(function (response) {
                    if (response.error) {
                        return my.flashService.error(response.error);
                    }
                    users = response.payload;
                    setScopeBears();
                });
            break;

            case 2:
                var crudService = my.bearsService.$crudService;

                Promise.all([
                    my.bearsService.List(),
                    my.usersService.List()
                ]).then(function (successResponses) {
                    var response = crudService.SuccessResponse(successResponses[0]);
                    bears = response.payload;
                    response = crudService.SuccessResponse(successResponses[1]);
                    users = response.payload;
                    setScopeBears();
                    my.$scope.$apply();
                }, function (failureResponse) {
                    var response = crudService.FailureResponse(failureResponse);
                    my.flashService.error(response.error);
                    my.$scope.$apply();
                });
            break;

            case 3:
                var promise1 = my.bearsService.List(function (response) {
                    if (response.error) {
                        return my.flashService.error(response.error);
                    }
                    bears = response.payload;
                });

                var promise2 = my.usersService.List(function (response) {
                    if (response.error) {
                        return my.flashService.error(response.error);
                    }
                    users = response.payload;
                });

                Promise.all([promise1, promise2]).then(function () {
                    setScopeBears();
                    my.$scope.$apply();
                }, function () {});
            break;
        }

        return;


        function setScopeBears() {
            if (! (bears.length && users.length)) {
                return;
            }
            _.forEach(bears, function (value, key) {
                var user = _.find(users, {name: value.name});
                if (! user) {
                    return;
                }
                value.roles = user.roles;
            });
            my.$scope.bears = bears;
        }
        
    }

})();
