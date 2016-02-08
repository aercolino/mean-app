(function() {
    'use strict';

    MyProject.codeSetup({
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
            login: login,
            resetPassword: resetPassword,
            section: 'Login'
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

        function resetPassword() {
            my.$rootScope.dataLoading = true;
            my.authenticationService.resetPassword(self.username, function(response) {
                if (!response.error) {
                    // Please, follow the instructions we just sent to your email address.
                    my.flashService.success(response);
                } else {
                    // There was an error: please, try again.
                    my.flashService.error(response.error);
                }
                my.$rootScope.dataLoading = false;
            });
        };

    }

})();
