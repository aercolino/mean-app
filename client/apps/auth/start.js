(function() {

    'use strict';

    // this initial piece of configuration makes it possible to require modules later
    // ---------------------------------------------------------------------------------------------------------- start
    angular
        .module(MyProject.appName, ['ngRoute', 'myRoute'])
        .config(['$compileProvider', '$controllerProvider', '$filterProvider', '$provide',
            MyProject.registerSetup
        ]);
    // ------------------------------------------------------------------------------------------------------------ end

    // this is the configuration for requirejs
    // ---------------------------------------------------------------------------------------------------------- start
    requirejs.config({
        // urlArgs: MyProject.uniqueUrl('?v=1.0').replace('?', ''),

        // paths is used for translating paths or path prefixes to absolute paths
        paths: {
            // help requirejs find dependencies internal to bower components
            jquery: '/bower_components/jquery/dist/jquery',
            angular: '/bower_components/angular/angular'
        }
    });

    // avoid double load of dependencies already loaded by means of a script tag 
    // https://github.com/jrburke/requirejs/issues/535#issuecomment-10540037
    define('jquery', function() {
        return jQuery;
    });
    define('angular', function() {
        return angular;
    });
    // ------------------------------------------------------------------------------------------------------------ end

    /* beautify preserve:start */

    require([
        '/shared/services/storage.service.js',         // for using localStorage without serializing / deserializing
        '/shared/services/authentication.service.js',  // for checking user credentials
        '/shared/services/flash.service.js',           // for giving feedback to the user

        '/shared/routes.js',
        '/shared/modules/my-layout.js',

        '/apps/auth/shared/config.js',
    ],

    /* beautify preserve:end */

        function() {
            'use strict';

            angular
                .module(MyProject.appName)
                .run(run);

            run.$inject = ['$rootScope', '$location', '$http', 'storageService', 'authenticationService', 'flashService'];

            function run($rootScope, $location, $http, storageService, authenticationService, flashService) {
                // getFullYear is used in the main layout
                $rootScope.currentYear = (new Date()).getFullYear();

                // nowAt is used in the sidebar of the authenticated layout
                $rootScope.nowAt = nowAt;

                // keep user logged in after page refresh
                $rootScope.globals = storageService.getItem('globals') || {};
                var loggedIn = !!$rootScope.globals.currentUser;
                if (loggedIn) {
                    setHeaderOrRedirect($rootScope.globals.currentUser.authdata);
                }

                $rootScope.$on('$locationChangeSuccess', function(event, next, current) {
                    // to make sure the loading indicator disappears for successful new pages
                    $rootScope.dataLoading = false;
                });

                $rootScope.$on('$locationChangeStart', function(event, next, current) {
                    // redirect to login page if not logged in and trying to access a restricted page
                    var anonymousPages = ['/login', '/register', '/reset-password'];
                    var restrictedPage = $.inArray($location.path(), anonymousPages) < 0;
                    var loggedIn = !!$rootScope.globals.currentUser;
                    if (restrictedPage && !loggedIn) {
                        $location.path('/login');
                    }
                });

                return;

                function setHeaderOrRedirect(token) {
                    $rootScope.dataLoading = true;
                    authenticationService.check(token, function(response) {
                        if (!response.error) {
                            if (response) {
                                $http.defaults.headers.common['X-Auth-Token'] = token; // jshint ignore:line
                            } else {
                                $location.path('/login');
                            }
                        } else {
                            $location.path('/login');
                            flashService.error(response.error, true);
                            $rootScope.dataLoading = false;
                        }
                    });
                }

                function nowAt(path) {
                    var result = location.hash.search(path) >= 0;
                    return result;
                }

            }

            angular.bootstrap(document, [MyProject.appName]);

        });

})();
