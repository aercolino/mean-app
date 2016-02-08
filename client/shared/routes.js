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

        $routeProvider

/*
si la APP del componente es la app actual, todo como antes
si la APP del componente es diferente, redirecciona a la APP usando la misma URL matchada
*/

        /* beautify preserve:start */

            .when('/login',                 route.forComponent('auth: login as vm'))

            .when('/register',              route.forComponent('auth: register as vm'))

            .when('/reset-password',        route.forComponent('auth: reset-password as vm'))


            .when('/',                      route.forComponent({
                                                app: 'core',
                                                path: '/index',
                                                controller: ''  // no controller here
                                            }))

            .when('/simulator/twist',       route.forComponent('core: plan-simulator/twist'))

            .when('/simulator/shake',       route.forComponent('core: plan-simulator/shake'))

        /* beautify preserve:end */

        .otherwise({
            redirectTo: function(params, path, search) {
                console.log('otherwise...');
                window.location.href = '/core/#/';
                return; // do not return a string !
            }
        });
    }

});
