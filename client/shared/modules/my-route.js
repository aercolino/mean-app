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

            function forComponent(options) {
                var matches = [];
                var result = {};
                if (_.isPlainObject(options)) {
                    result = options;
                } else {
                    var simplified = options.replace(/^\s+|\s+$/, '').replace(/\s+/, ' ').replace(/ ?: ?/, ':');
                    var formatAppPathAlias = /(?:([\w-]+):)?([\/\w-]+)(?: as ([\w-]+))?/i;
                    result = match(simplified, formatAppPathAlias, ['', 'app', 'folder', 'controllerAs']);
                }

                if (!result.folder) {
                    throw 'Expected a folder for the component.';
                }

                var appName = result.app;
                if (appName && MyProject.appName !== appName) {
                    return redirectTo('/apps/' + appName);
                }

                if (result.folder[0] == '/') {
                    // expecting a folder relative to /apps/<app>
                    result.folder = '/apps/' + appName + result.folder;
                } else {
                    // expecting a folder relative to /apps/<app>/components
                    if (result.folder.search('/') > 0) {
                        // explicit folder (always without extension), like: 'plans-simulator/twist' --> '/apps/core/components/plans-simulator/twist'
                        // use the folder as is
                    } else {
                        // implicit folder (always without extension), like: 'login'                 --> '/apps/auth/components/login/login'
                        // double the folder
                        result.folder += '/' + result.folder;
                    }
                    result.folder = '/apps/' + appName + '/components/' + result.folder;
                }
                
                var formatPathToFile = /^((?:\/[\w-]+)*)\/([\w-]+)$/;
                result = _.extend(
                    match(result.folder, formatPathToFile, ['', '', 'name']),
                    result
                );
                result = _.extend(
                    {
                        templateUrl: result.folder + '.html',
                        controller: _.camelCase(result.name) + 'Controller',
                        controllerUrl: result.folder + '.js'
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
