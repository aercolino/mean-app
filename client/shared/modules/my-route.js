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

        this.route = (function() {  // stick to AngularJS name convention to blend seamlessly

            return {
                forComponent: ForComponent  // stick to AngularJS name convention to blend seamlessly 
            };


            function NamedMatch(source, regexp, names) {
                var result = {};
                var matches = source.match(regexp);
                for (var i = 0, iTop = names.length; i < iTop; i++) {
                    if (! names[i]) continue;
                    result[names[i]] = matches[i];
                }
                return result;
            }

            function InitRoute(options) {
                var result = {};
                if (_.isPlainObject(options)) {
                    result = options;
                } else {
                    var simplified = options.replace(/^\s+|\s+$/, '').replace(/\s+/, ' ').replace(/ ?: ?/, ':');
                    var formatAppPathAlias = /(?:([\w-]+):)?([\/\w-]+)(?: as ([\w-]+))?/i;
                    result = NamedMatch(simplified, formatAppPathAlias, ['', 'app', 'filepath', 'controllerAs']);
                }
                return result;
            }

            function RedirectTo(appRoot) {
                return {
                    redirectTo: function(params, path, search) {
                        // Replace instead of assign, because we get here only when crossing an SPA border.
                        // In such a case, the current URL is "wrong". Examples: "/auth/#/", "/core/#/login"...
                        var new_path = appRoot + '/#' + path;
                        window.location.replace(new_path);
                        return; // do not return a string !
                    }
                };
            }

            function RealPath(filepath) {
                var result = filepath;
                if (filepath[0] == '/') {
                    // expecting a filepath relative to '<appRoot>'
                } else {
                    // expecting a filepath relative to '<appRoot>/components'
                    if (filepath.search('/') > 0) {
                        // explicit filepath (always without extension)
                        // like: 'some-folder/some-file' --> '<appRoot>/components/some-folder/some-file'
                    } else {
                        // implicit filepath (always without extension)
                        // like: 'some-file'             --> '<appRoot>/components/some-file/some-file'
                        result += '/' + filepath;
                    }
                    result = '/components/' + result;
                }
                return result;
            }

            function DefaultRoute(filepath) {
                var formatPathToFile = /^((?:\/[\w-]+)*)\/([\w-]+)$/;
                var file = NamedMatch(filepath, formatPathToFile, ['', '', 'file']).file;
                var result = {
                    title: _.startCase(file),
                    templateUrl: filepath + '.html',
                    controller: _.camelCase(file) + 'Controller',
                    controllerUrl: filepath + '.js'
                };
                return result;
            }

            function RequireDependencies($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function() {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }

            function LoadController(route) {
                var result = {};
                var dependencies = route.controller ? [route.controllerUrl] : [];
                if (dependencies.length) {
                    var promiseName = 'load ' + route.controller;
                    var promiseMap = {};
                    promiseMap[promiseName] = ['$q', '$rootScope', function ($q, $rootScope) {
                        // we are going to a route inside the same SPA we are into
                        // because we took care earlier about crossing the SPA border
                        return RequireDependencies($q, $rootScope, dependencies);
                    }];
                    result.resolve = _.extend(route.resolve || {}, promiseMap);
                }
                return result;
            }

            function ForComponent(options) {
                var result = InitRoute(options);
                if (!result.filepath) {
                    throw 'Expected a filepath for the component.';
                }

                var appName = result.app;
                var appRoot = '/apps/' + appName;
                if (appName && MyProject.AppName() !== appName) {
                    return RedirectTo(appRoot);
                }

                result.filepath = appRoot + RealPath(result.filepath);
                result = _.extend(DefaultRoute(result.filepath), result);
                result = _.extend(result, LoadController(result));
                return result;
            }
        })();

    }

})();
