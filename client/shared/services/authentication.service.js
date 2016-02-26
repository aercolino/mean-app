(function () {
    'use strict';

    MyProject.CodeSetup({
        type: 'factory',
        name: 'authenticationService',
        dependencies: ['$http', '$rootScope', '$location'],
        services: ['storageService', 'flashService'],
        code: main
    });


    function main(my) {
        var self = {
            login: login,
            check: check,
            setCredentials: setCredentials,
            clearCredentials: clearCredentials,
            resetPassword: resetPassword,
            ValidateAccess: ValidateAccess
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
                .get('/api/tokens/' + token)
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

            delete my.$http.defaults.headers.common['x-access-token'];
            my.storageService.removeItem('globals');
        }


        function resetPassword(username, callback) {
            my.$http
                .post('/api/users/reset-password', { 
                    username: username })
                .then(function (success) {
                    callback(success.data);
                }, function (failure) {
                    callback({
                        error: messageFor(failure)
                    });
                });
        }

        function ValidateAccess() {
            ValidateUser();
            ProtectAccess();

            return;


            function ValidateUser() {
                my.$rootScope.globals = my.storageService.getItem('globals') || {};
                var loggedIn = !! my.$rootScope.globals.currentUser;
                if (loggedIn) {
                    ContinueOrLogout(my.$rootScope.globals.currentUser.authdata);
                }
            }

            function ContinueOrLogout(token) {
                check(token, function(response) {
                    var message = '';
                    if (response.success) {
                        my.$http.defaults.headers.common['x-access-token'] = token;
                        message = my.$location.path() !== '/login' ? 'Welcome back' : 'See you soon';
                        message += ', ' + response.payload + '.';
                        my.flashService.success(message);
                        return;
                    }
                    my.$location.path('/login');
                    message = response.error ? response.error : JSON.stringify(response);
                    my.flashService.error(message, true);
                });
            }

            function ProtectAccess() {
                my.$rootScope.$on('$locationChangeStart', function(event) {
                    var restricted = MyProject.RouteIsRestricted(my.$location.path());
                    var loggedIn = !! my.$rootScope.globals.currentUser;
                    if (restricted && !loggedIn) {
                        event.preventDefault();
                        my.$location.path('/login');
                    }
                });
            }
        }
    }

})();
