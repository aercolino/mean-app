(function() {
    'use strict';

    MyProject.Config({
        appName: 'auth',
        requireJS: true
    });

    // config the app ASAP to load modules using RequireJS even before
    // ---------------------------------------------------------------------------------------------------------- start
    angular
        .module(MyProject.AppName(), ['ngRoute', 'myRoute'])
        .config(['$compileProvider', '$controllerProvider', '$filterProvider', '$provide',
            MyProject.RegisterSetup
        ]);
    // ------------------------------------------------------------------------------------------------------------ end

    /* beautify preserve:start */

    require([
        '/shared/services/storage.service.js',         // for caching localStorage in memory
        '/shared/services/authentication.service.js',  // for checking user credentials
        '/shared/services/flash.service.js',           // for giving feedback to the user

        '/shared/config.js',
        '/shared/routes.js'
    ],

    /* beautify preserve:end */

        function() {
            angular
                .module(MyProject.AppName())
                .run(run);

            run.$inject = ['$rootScope', 'authenticationService'];

            function run($rootScope, authenticationService) {
                $rootScope.appTime = new Date();
                authenticationService.ValidateAccess();
                MyProject.SetTitle($rootScope);

                $rootScope.$on('$locationChangeStart', function() {
                    $rootScope.dataLoading = true;
                });

                $rootScope.$on('$locationChangeSuccess', function() {
                    $rootScope.dataLoading = false;
                });
            }

            angular.bootstrap(document, [MyProject.AppName()]);
        });

})();
