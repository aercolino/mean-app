(function(global) {

    // var appName = 'app';
    var useCurrentFolder = /^\.\//;
    var register = null;

    global.MyProject = {
        appName: 'app',
        currentUser: currentUser,
        uniqueUrl: uniqueUrl,
        registerSetup: registerSetup,
        codeSetup: codeSetup
    };
    // Object.defineProperty(global.MyProject, 'appName', {
    //     value: appName
    // });

    return;

    function currentUser() {
        try {
            var injector = angular.element(document).injector();
            var storageService = injector.get('storageService');
            var globals = storageService.getItem('globals');
            return globals.currentUser;
        } catch (e) {
            return null;
        }
    }

    function uniqueUrl(path, unique) {
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

    function service(name) {
        var result = angular.element(document.body).injector().get(name);
        return result;
    }

    function registerSetup($compileProvider, $controllerProvider, $filterProvider, $provide) {
        register = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            factory: $provide.factory,
            filter: $filterProvider.register,
            service: $provide.service
        };
    }

    /**
     * Setup a service or a controller.
     *
     * @param my Hash
     *   type         in ['factory', 'controller']
     *   name         identifier
     *   dependencies Array[String]
     *   services     Array[String]
     *   code         function
     */
    function codeSetup(my) {
        if (!_.isPlainObject(my)) {
            throw 'Expected a hash of options.';
        }
        if (!_.isFunction(my.code)) {
            throw 'Expected a function into the "code" option.';
        }
        if (!(my.name !== '')) {
            throw 'Expected an identifier into the "name" option.';
        }
        if (!(_.inArray(my.type, ['controller', 'directive', 'factory', 'filter', 'service']) >= 0)) {
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
            var path = '/shared/services';
            var svc = svcName.replace(/Service$/, '.service.js');
            if (svcName.search(useCurrentFolder) >= 0) {
                path = service('$route').current.$$route.path;
                svc = svc.replace(useCurrentFolder, '');
            }
            var modulePath = path + '/' + svc;
            paths.push(modulePath);
            var moduleName = svcName.replace(useCurrentFolder, '');
            services.push(moduleName);
            // console.log(moduleName + ': ' + modulePath);
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
                angular.module(MyProject.appName)[my.type](my.name, runner);
            }
        });
    }

})(window);
