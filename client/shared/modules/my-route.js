(function() {
    'use strict';

    // https://github.com/DanWahlin/CustomerManager/blob/master/CustomerManager/app/customersApp/services/routeResolver.js 
    // as previously modified by MyProject devs, plus "forComponent()" added by Andrea Ercolino for MyProject.

    // Note that this service is a module hosting a provider (it is loaded by the routes definition file)
    // (we are not using MyProject.codeSetup here because this is not a component of 'app')

    angular
        .module('myRoute', [])
        .constant('_', window._)
        .provider('route', provider); // 'route' is seen outside as 'routeProvider'

    function provider() {

        this.$get = function() {
            return this;
        };

        this.route = function() {

            function match(source, regexp, names) {
                var result = {};
                var matches = source.match(regexp);
                for (var i = 0, iTop = names.length; i < iTop; i++) {
                    if (! names[i]) continue;
                    result[names[i]] = matches[i];
                }
                return result;
            }

            function redirectTo(appRoot) {
                return {
                    redirectTo: function(params, path, search) {
                        window.location.href = appRoot + '/#' + path;
                        return; // do not return a string !
                    }
                };
            }

            function resolveDependencies($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function() {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }

            function forComponent(path, options) {
                var matches = [];
                var result = {};
                if (jQuery.isPlainObject(path)) {
                    result = path;
                } else {
                    var simplified = path.replace(/^\s+|\s+$/, '').replace(/\s+/, ' ').replace(/ ?: ?/, ':');
                    var formatAppPathAlias = /(?:([\w-]+):)?([\/\w-]+)(?: as ([\w-]+))?/i;
                    result = match(simplified, formatAppPathAlias, ['', 'app', 'path', 'controllerAs']);
                }

                if (!result.path) {
                    throw 'Expected a path for the component.';
                }

// TODO find where to get the current app from, because $route is undefined here
                // if (result.app && (result.app != $route.current.app)) {
                //     return redirectTo('/apps/' + result.app);
                // }

                if (result.path[0] == '/') {
                    // expecting a path relative to /apps/<app>
                    result.path = '/apps/' + result.app + result.path;
                } else {
                    // expecting a path relative to /apps/<app>/components
                    if (result.path.search('/') > 0) {
                        // explicit path (always without extension), like: 'plans-simulator/twist' --> '/apps/core/components/plans-simulator/twist'
                        // use the path as is
                    } else {
                        // implicit path (always without extension), like: 'login'                 --> '/apps/auth/components/login/login'
                        // double the path
                        result.path += '/' + result.path;
                    }
                    result.path = '/apps/' + result.app + '/components/' + result.path;
                }
                
                var formatPathToFile = /^((?:\/[\w-]+)*)\/([\w-]+)$/;
                result = jQuery.extend(
                    match(result.path, formatPathToFile, ['', '', 'name']),
                    result
                );
                result = jQuery.extend(
                    {
                        templateUrl: result.path + '.html',
                        controller: _.camelCase(result.name) + 'Controller'
                    },
                    result
                );

                var app = result.app;
                var dependencies = result.controller ? [result.path + '.js'] : [];
                result.resolve = {
                    load: ['$q', '$rootScope', '$route', function($q, $rootScope, $route) {
                        if ($route.current.app && $route.current.app === app) {
                            // we are going to a route inside the SPA we are into
                            return resolveDependencies($q, $rootScope, dependencies);
                        } else {
                            // we are going to a route outside the SPA we are into
                            return redirectTo('/apps/' + app);
                        }
                    }]
                };
                return result;
            }

            return {
                forComponent: forComponent
            };
        }();

    }

})();
