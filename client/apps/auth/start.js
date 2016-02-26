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

            run.$inject = ['$rootScope', '$location', '$http', 'storageService', 'authenticationService', 'flashService'];

            function run($rootScope, $location, $http, storageService, authenticationService, flashService) {
                $rootScope.appTime = new Date();
                CheckLogin();

                    var restricted = MyProject.RouteIsRestricted($location);
                    var loggedIn = !!$rootScope.globals.currentUser;
                    if (restricted && !loggedIn) {
                        $location.path('/login');
                    }
                    $rootScope.dataLoading = true;
                });

                    $rootScope.dataLoading = false;
                });

                return;


                function CheckLogin() {
                    $rootScope.globals = storageService.getItem('globals') || {};
                    var loggedIn = !!$rootScope.globals.currentUser;
                    if (loggedIn) {
                        ContinueOrLogout($rootScope.globals.currentUser.authdata);
                    }
                }

                function ContinueOrLogout(token) {
                    authenticationService.check(token, function(response) {
                        var message = '';
                        if (response.success) {
                            $http.defaults.headers.common['x-access-token'] = token;
                            message = $location.path() !== '/login' ? 'Welcome back' : 'See you soon';
                            message += ', ' + response.payload + '.';
                            flashService.success(message);
                            return;
                        }
                        $location.path('/login');
                        message = response.error ? response.error : JSON.stringify(response);
                        flashService.error(message, true);
                    });
                }
            }

            angular.bootstrap(document, [MyProject.AppName()]);
        });

})();
