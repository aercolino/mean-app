(function(global) {

    var appName = 'app';
    var anonymousRoutes = [];
    var register = null;

    global.MyProject = {
        AppName: AppName,
        RouteIsRestricted: RouteIsRestricted,
        Config: Config,
        Service: Service,
        CurrentUser: CurrentUser,
        UniqueUrl: UniqueUrl,
        RegisterSetup: RegisterSetup,
        CodeSetup: CodeSetup
    };

    return;


    function AppName() {
        return appName;
    }

    function AnonymousRoutes() {
        return anonymousRoutes;
    }

    function RouteIsRestricted($location) {
        var result = _.indexOf(anonymousRoutes, $location.path()) < 0;
        return result;
    }

    function Config(options) {
        var available = {
            appName: ConfigAppName,
            requireJS: ConfigRequireJS,
            anonymousRoutes: ConfigAnonymousRoutes
        };
        var keys = Object.keys(options);
        _.forEach(keys, function (key) {
            if (available[key]) {
                available[key].call(options, options[key]);
            }
        });
    }

    function ConfigAppName(name) {
        appName = name;
    }

    function ConfigRequireJS() {
        requirejs.config({
            // urlArgs: MyProject.UniqueUrl('?v=1.0').replace('?', ''),

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
    }

    function ConfigAnonymousRoutes(routes) {
        anonymousRoutes = routes;
    }

    function Service(name) {
        try {
            var result = angular.element(document.body).injector().get(name);
            return result;
        } catch (e) {
            return {};
        }
    }

    function CurrentUser() {
        try {
            var storageService = Service('storageService');
            var globals = storageService.getItem('globals');
            return globals.currentUser;
        } catch (e) {
            return {};
        }
    }

    function UniqueUrl(path, unique) {
        if (typeof unique == 'undefined') {
            unique = (new Date).valueOf();
        }
        var slash = path[0] == '/';
        if (!slash) {
            path = '/' + path;
        }
        var splitPath = path.split(/(?:^\/|\?|\#)/);
        var pathname = splitPath[1];
        var search = splitPath[2];
        var hash = splitPath[3];

        if (search) {
            search = search + '&' + unique + '=1';
        } else {
            search = unique + '=1'
        }

        var result = (slash ? '/' : '') + (pathname ? pathname : '') + '?' + search + (hash ? '#' + hash : '');
        return result;
    }

    function RegisterSetup($compileProvider, $controllerProvider, $filterProvider, $provide) {
        register = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            factory: $provide.factory,
            filter: $filterProvider.register,
            service: $provide.service
        };
    }

    function moduleConvention(moduleName) {
        var dotSlashStart = /^\.\//;
        var componentLevel = moduleName.search(dotSlashStart) === 0;

        var slashStart = /^\//;
        var appLevel = moduleName.search(slashStart) === 0;

        var wordStart = /^[\w-]/;
        var clientLevel = moduleName.search(wordStart) === 0;

        var path = '';
        switch (true) {
            case componentLevel:
                path = Service('$route').current.path;
            break;

            case appLevel:
                path = '/apps/' + appName + '/shared/services';
            break;

            case clientLevel:
                path = '/shared/services';
            break;

            default:
                throw new Error('Expected a service at client, app, or component level.');
            break;
        }
        var pureName = moduleName.replace(/^\W+/, '');
        var nameBeforeService = pureName.replace(/Service$/, '');
        var fileName = _.kebabCase(nameBeforeService) + '.service.js';
        var fullPath = path + '/' + fileName;
        return {
            name: pureName,
            path: fullPath
        };
    }

    /**
     * Setup a service or a controller.
     *
     * @param my Hash
     *   type         like 'factory', 'controller', ...
     *   name         identifier
     *   dependencies Array[String]
     *   services     Array[String]
     *   code         function
     */
    function CodeSetup(my) {
        if (!_.isPlainObject(my)) {
            throw 'Expected a hash of options.';
        }
        if (!_.isFunction(my.code)) {
            throw 'Expected a function into the "code" option.';
        }
        if (!(my.name !== '')) {
            throw 'Expected an identifier into the "name" option.';
        }
        if (!(_.indexOf(['controller', 'directive', 'factory', 'filter', 'service'], my.type) >= 0)) {
            throw 'Expected a supported type into the "type" option. (' + my.type + ')';
        }
        if (!_.isArray(my.services)) {
            console.warn('Expected an array into the "services" option. Using [].');
            my.services = [];
        }
        if (!_.isArray(my.dependencies)) {
            console.warn('Expected an array into the "dependencies" option. Using [].');
            my.dependencies = [];
        }

        var services = [];
        var paths = [];
        my.services.forEach(function(svcName) {
            var module = moduleConvention(svcName);
            paths.push(module.path);
            services.push(module.name);
        });

        define(paths, function() {
            function runner() {
                var options = {
                    type: my.type,
                    name: my.name
                };
                for (var i = 0, iTop = arguments.length; i < iTop; i++) {
                    options[runner.$inject[i]] = arguments[i];
                }
                return my.code(options);
            }
            runner.$inject = my.dependencies.concat(services);

            if (register) {
                // this allows to register stuff after the bootstrap
                register[my.type](my.name, runner);
            } else {
                // this allows to register stuff before the bootstrap
                angular.module(appName)[my.type](my.name, runner);
            }
        });
    }

})(window);
