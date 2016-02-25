(function () {
    'use strict';

    MyProject.CodeSetup({
        type: 'factory',
        name: 'flashService',
        dependencies: ['$rootScope'],
        services: [],
        code: main
    });

    function main(my) {
        var self = {
            success: success,
            error: error
        };

        initService();

        return self;

        function initService() {
            my.$rootScope.$on('$locationChangeStart', function () {
                clearFlashMessage();
            });

            function clearFlashMessage() {
                var flash = my.$rootScope.flash;
                if (flash) {
                    if (!flash.keepAfterLocationChange) {
                        delete my.$rootScope.flash;
                    } else {
                        // only keep for a single location change
                        flash.keepAfterLocationChange = false;
                    }
                }
            }
        }

        function success(message, keepAfterLocationChange) {
            my.$rootScope.flash = {
                message: message,
                type: 'success', 
                keepAfterLocationChange: keepAfterLocationChange
            };
        }

        function error(message, keepAfterLocationChange) {
            my.$rootScope.flash = {
                message: message,
                type: 'error',
                keepAfterLocationChange: keepAfterLocationChange
            };
        }
    }

})();
