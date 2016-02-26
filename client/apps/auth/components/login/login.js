(function() {
    'use strict';

    MyProject.CodeSetup({
        type: 'controller',
        name: 'loginController',
        dependencies: ['$rootScope', '$location'],
        services: ['authenticationService', 'flashService'],
        code: main
    });

    function main(my) {
        my.authenticationService.clearCredentials();
        my.$rootScope.dataLoading = false;

        var self = {
            username: '',
            password: '',
            login: login
        };
        
        return self;

        function login() {
            my.$rootScope.dataLoading = true;
            my.authenticationService.login(self.username, self.password, function(response) {
                if (!response.error) {
                    my.authenticationService.setCredentials(self.username, response);
                    my.$location.path('/');
                } else {
                    my.flashService.error(response.error);
                }
                my.$rootScope.dataLoading = false;
            });
        };
    }

})();
