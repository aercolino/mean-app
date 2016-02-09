define([
    '/shared/modules/my-route.js'  // loads routeProvider (no $ prefix)
], function() {
    'use strict';

    angular
        .module(MyProject.appName)
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
                                                path: 'home',
                                                controller: ''
                                            }))

            // Case 2: This works like Case 1, but it requires a controller at /apps/core/components/home/home.js.
            // .when('/',                      route.forComponent('core: home'))

            // Case 3: This works like Case 2, but using an empty controller.
            // .when('/',                      route.forComponent({
            //                                     app: 'core',
            //                                     path: 'home',
            //                                     controller: 'myEmptyController',
            //                                     controllerUrl: '/shared/modules/my-empty-controller.js'
            //                                 }))

            // This does not work because AngularJS tries to infinitely load /apps/core/index.html into the ng-view of the previous /apps/core/index.html.
            // .when('/',                      route.forComponent({
            //                                     app: 'core',
            //                                     path: '/index',
            //                                     controller: ''
            //                                 }))

            // .when('/path-to/some-stuff',      route.forComponent('core: some-dir/something'))
            // .when('/path-to/more-stuff',      route.forComponent('core: some-dir/anything'))

            .when('/bears',                 route.forComponent('core: bears'))

            .otherwise({
                redirectTo: function(params, path, search) {
                    console.log('otherwise...');
                    window.location.href = '/apps/core/#/';
                    return; // do not return a string !
                }
            });
        /* beautify preserve:end */

    }

});
