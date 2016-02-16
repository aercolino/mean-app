(function () {
    'use strict';

    MyProject.codeSetup({
        type: 'factory',
        name: 'crudService',
        dependencies: ['$http'],
        services: [],
        code: main
    });


    function main(my) {
        var self = {
            Init: Init
        };

        return self;


        function DefaultConfig() {
            function ValidateNotEmptyString(value, key) {
                if (! value) {
                    throw new Error('Expected a non-empty string for "' + key + '".');
                }
                else {
                    return '' + value; 
                }
            }

            return {
                endpoint:       {default: '', filter: ValidateNotEmptyString},
                endpointList:   {default: ''},
                endpointCreate: {default: ''},
                endpointRead:   {default: ''},
                endpointUpdate: {default: ''},
                endpointDelete: {default: ''},
            };
        }


        function Init(options) {
            // Discard unknown keys in user supplied options
            options = _.pick(options, _.keys(DefaultConfig()));

            // Init config to default options
            var config = _.mapValues(DefaultConfig(), 'default');

            // Merge user supplied options into config
            config = _.assign(config, options);

            // Make sure config has proper values
            _.forEach(_.mapValues(DefaultConfig(), 'filter'), function (filter, key) {
                if (_.isFunction(filter)) {
                    config[key] = filter(config[key]);
                }
            });

            var self = {
                List:   List,
                Create: Create,
                Read:   Read,
                Update: Update,
                Delete: Delete
            };

            return self;


            function messageFor(failure) {
                var result = 'Error';
                result += ' ' + failure.status + ' (' + failure.statusText + ')';
                result += ' @ ' + (new Date());
                result += failure.data.message ? '\n' + failure.data.message : '';
                return result;
            }


            function List(callback) {
                my.$http
                    .get(config.endpointList || config.endpoint)
                    .then(function (success) {
                        callback(success.data);
                    }, function (failure) {
                        callback({
                            error: messageFor(failure)
                        });
                    });
            }


            function Create(data, callback) {
                my.$http
                    .post(config.endpointCreate || config.endpoint, data)
                    .then(function (success) {
                        callback(success.data);
                    }, function (failure) {
                        callback({
                            error: messageFor(failure)
                        });
                    });
            }


            function Read(id, callback) {
                my.$http
                    .get((config.endpointRead || config.endpoint) + id)
                    .then(function (success) {
                        callback(success.data);
                    }, function (failure) {
                        callback({
                            error: messageFor(failure)
                        });
                    });
            }


            function Update(id, data, callback) {
                my.$http
                    .put((config.endpointUpdate || config.endpoint) + id, data)
                    .then(function (success) {
                        callback(success.data);
                    }, function (failure) {
                        callback({
                            error: messageFor(failure)
                        });
                    });
            }


            function Delete(id, callback) {
                my.$http
                    .delete((config.endpointDelete || config.endpoint) + id)
                    .then(function (success) {
                        callback(success.data);
                    }, function (failure) {
                        callback({
                            error: messageFor(failure)
                        });
                    });
            }
        }
    }

})();
