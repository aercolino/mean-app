(function() {
    'use strict';

    MyProject.codeSetup({
        type: 'controller',
        name: 'registerController',
        dependencies: ['$rootScope', '$location'],
        services: ['authenticationService', 'flashService'],
        code: main
    });

    function main(my) {
        my.authenticationService.clearCredentials();
        my.$rootScope.dataLoading = false;

        var self = {
            firstName: '',
            lastName: '',
            username: '',
            password: '',
            register: register
        };

        return self;

        function register() {
            my.$rootScope.dataLoading = true;
            my.authenticationService.register(self.firstName, self.lastName, self.username, self.password, function(response) {
                if (!response.error) {
                    my.flashService.success('Registration Sucessful', true);
                    my.$location.path('/login');
                } else {
                    my.flashService.error(response.error);
                }
                my.$rootScope.dataLoading = false;
            });
        };
    }

})();
