(function() {
    'use strict';

    // See https://github.com/DanWahlin/CustomerManager/blob/master/CustomerManager/app/customersApp/services/routeResolver.js 

    // Note that this service is a module hosting a provider (it is loaded by the routes definition file)
    // (we are not using MyProject.codeSetup here because this is not a component of an application)

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

            function forComponent(path) {
                var matches = [];
                var result = {};
                if (_.isPlainObject(path)) {
                    result = path;
                } else {
                    var simplified = path.replace(/^\s+|\s+$/, '').replace(/\s+/, ' ').replace(/ ?: ?/, ':');
                    var formatAppPathAlias = /(?:([\w-]+):)?([\/\w-]+)(?: as ([\w-]+))?/i;
                    result = match(simplified, formatAppPathAlias, ['', 'app', 'path', 'controllerAs']);
                }

                if (!result.path) {
                    throw 'Expected a path for the component.';
                }

                var appName = result.app;
                if (appName && MyProject.appName !== appName) {
                    return redirectTo('/apps/' + appName);
                }

                if (result.path[0] == '/') {
                    // expecting a path relative to /apps/<app>
                    result.path = '/apps/' + appName + result.path;
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
                    result.path = '/apps/' + appName + '/components/' + result.path;
                }
                
                var formatPathToFile = /^((?:\/[\w-]+)*)\/([\w-]+)$/;
                result = _.extend(
                    match(result.path, formatPathToFile, ['', '', 'name']),
                    result
                );
                result = _.extend(
                    {
                        templateUrl: result.path + '.html',
                        controller: _.camelCase(result.name) + 'Controller',
                        controllerUrl: result.path + '.js'
                    },
                    result
                );

                var dependencies = result.controller ? [result.controllerUrl] : [];
                if (dependencies.length) {
                    result.resolve = {
                        load: ['$q', '$rootScope', '$route', function($q, $rootScope, $route) {
                            if (appName && MyProject.appName === appName) {
                                // we are going to a route inside the SPA we are into
                                return resolveDependencies($q, $rootScope, dependencies);
                            } else {
                                // this should not happen...
                            }
                        }]
                    };
                }
                return result;
            }

            return {
                forComponent: forComponent
            };
        }();

    }

})();
