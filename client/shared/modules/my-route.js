(function() {
    'use strict';

    // See https://github.com/DanWahlin/CustomerManager/blob/master/CustomerManager/app/customersApp/services/routeResolver.js 

    // Note that this service is a module hosting a provider (it is loaded by the routes definition file)
    // (we are not using MyProject.CodeSetup here because this is not a component of an application)

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
                        var new_path = appRoot + '/#' + path;
                        window.location.href = new_path;
                        //window.location.replace(new_path);
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
                    result = match(simplified, formatAppPathAlias, ['', 'app', 'filepath', 'controllerAs']);
                }

                if (!result.filepath) {
                    throw 'Expected a filepath for the component.';
                }

                var appName = result.app;
                if (appName && MyProject.AppName() !== appName) {
                    return redirectTo('/apps/' + appName);
                }

                if (result.filepath[0] == '/') {
                    // expecting a filepath relative to /apps/<app>
                    result.filepath = '/apps/' + appName + result.filepath;
                } else {
                    // expecting a filepath relative to /apps/<app>/components
                    if (result.filepath.search('/') > 0) {
                        // explicit filepath (always without extension)
                        // like: 'plans-simulator/twist' --> '/apps/core/components/plans-simulator/twist'
                        // use the filepath as is
                    } else {
                        // implicit filepath (always without extension)
                        // like: 'login'                 --> '/apps/auth/components/login/login'
                        // double the filepath
                        result.filepath += '/' + result.filepath;
                    }
                    result.filepath = '/apps/' + appName + '/components/' + result.filepath;
                }
                
                var formatPathToFile = /^((?:\/[\w-]+)*)\/([\w-]+)$/;
                var file = match(result.filepath, formatPathToFile, ['', '', 'file']).file;
                result = _.extend(
                    {
                        templateUrl: result.filepath + '.html',
                        controller: _.camelCase(file) + 'Controller',
                        controllerUrl: result.filepath + '.js'
                    },
                    result
                );

                var dependencies = result.controller ? [result.controllerUrl] : [];
                if (dependencies.length) {
                    result.resolve = _.extend(result.resolve || {}, {
                        load: ['$q', '$rootScope', '$route', function($q, $rootScope, $route) {
                            if (appName && MyProject.AppName() === appName) {
                                // we are going to a route inside the same SPA we are into
                                return resolveDependencies($q, $rootScope, dependencies);
                            } else {
                                // this should not happen because we took care of it earlier
                            }
                        }]
                    });
                }
                return result;
            }

            return {
                forComponent: forComponent
            };
        }();

    }

})();
