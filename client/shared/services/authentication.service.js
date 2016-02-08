(function () {
    'use strict';

    MyProject.codeSetup({
        type: 'factory',
        name: 'authenticationService',
        dependencies: ['$http', '$rootScope', 'config'],
        services: ['storageService'],
        code: main
    });


    function main(my) {
        var self = {
            login: login,
            check: check,
            setCredentials: setCredentials,
            clearCredentials: clearCredentials,
            resetPassword: resetPassword
        };

        return self;


        function messageFor(failure) {
            var result = 'Error';
            result += ' ' + failure.status + ' (' + failure.statusText + ')';
            result += ' @ ' + (new Date);
            result += failure.data.message ? '\n' + failure.data.message : '';
            return result;
        }


        function login(username, password, callback) {
            my.$http
                .post('/api/tokens', { 
                    name: username, 
                    password: password })
                .then(function (success) {
                    callback(success.data.payload);
                }, function (failure) {
                    callback({
                        error: messageFor(failure)
                    });
                });
        }


        function check(token, callback) {
            my.$http
                .get(my.config.urlSecurityService + '/authn/check/' + token)
                .then(function (success) {
                    callback(success.data);
                }, function (failure) {
                    callback({
                        error: messageFor(failure)
                    });
                });
        };


        function setCredentials(username, authdata) {
            my.$rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                }
            };

            my.$http.defaults.headers.common['x-access-token'] = authdata;
            my.storageService.setItem('globals', my.$rootScope.globals);
        }


        function clearCredentials() {
            my.$rootScope.globals = {
                currentUser: null
            };

            delete my.$http.defaults.headers.common['X-Auth-Token'];
            my.storageService.removeItem('globals');
        }


        function resetPassword(username, callback) {
            my.$http
                .post(my.config.urlSecurityService + '/resetPassword', { 
                    username: username })
                .then(function (success) {
                    callback(success.data);
                }, function (failure) {
                    callback({
                        error: messageFor(failure)
                    });
                });
        }
    }

})();