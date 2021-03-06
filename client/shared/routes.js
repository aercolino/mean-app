define([
    '/shared/modules/my-route.js'  // loads routeProvider (no $ prefix)
], function() {
    'use strict';

    MyProject.Config({
        anonymousRoutes: ['/login', '/register', '/reset-password']
    });

    angular
        .module(MyProject.AppName())
        .config(routes);

    routes.$inject = ['$routeProvider', 'routeProvider'];

    function routes($routeProvider, routeProvider) {

        var route = routeProvider.route;

        /* beautify preserve:start */

        $routeProvider

            .when('/login',                 route.forComponent('auth: login as vm'))
            .when('/register',              route.forComponent('auth: register as vm'))
            .when('/reset-password',        route.forComponent('auth: reset-password as vm'))

            // Case 1: This works because AngularJS allows a view without a controller (but it does not allow a route without a view).
            .when('/',                      route.forComponent({
                                                app: 'core',
                                                filepath: 'home',
                                                controller: '',
                                                title: ''
                                            }))

            // Case 2: This works like Case 1, but it requires a controller at /apps/core/components/home/home.js.
            // .when('/',                      route.forComponent('core: home'))

            // Case 3: This works like Case 2, but using an empty controller.
            // .when('/',                      route.forComponent({
            //                                     app: 'core',
            //                                     filepath: 'home',
            //                                     controller: 'myEmptyController',
            //                                     controllerUrl: '/shared/modules/my-empty-controller.js'
            //                                 }))

            // .when('/path-to/some-stuff',      route.forComponent('core: some-dir/something'))
            // .when('/path-to/more-stuff',      route.forComponent('core: some-dir/anything'))

            .when('/bears',                 route.forComponent('core: bears'))

            .otherwise({
                redirectTo: function(params, path, search) {
                    console.log('otherwise...');
                    return '/';
                }
            });
        /* beautify preserve:end */

    }

});
