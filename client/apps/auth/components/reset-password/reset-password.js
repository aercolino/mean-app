(function() {
    'use strict';

    MyProject.codeSetup({
        type: 'controller',
        name: 'resetPasswordController',
        dependencies: ['$rootScope', '$location'],
        services: ['authenticationService', 'flashService'],
        code: main
    });

    function main(my) {
        my.authenticationService.clearCredentials();
        my.$rootScope.dataLoading = false;

        var self = {
            username: '',
            resetPassword: resetPassword
        };

        return self;

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
