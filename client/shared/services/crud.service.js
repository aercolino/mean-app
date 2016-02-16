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


        function StandardSuccess(successResponse) {
            return successResponse.data;
        }


        function StandardFailure(failureResponse) {
            function MessageFor(failureResponse) {
                var result = 'Error';
                result += ' ' + failureResponse.status + ' (' + failureResponse.statusText + ')';
                result += ' @ ' + (new Date());
                if (_.isPlainObject(failureResponse.data)) {
                    result += failureResponse.data.message ? '\n' + failureResponse.data.message : '';
                } else
                if (_.isString(failureResponse.data)) {
                    result += '\n' + failureResponse.data;
                } else {
                    result += '\n' + JSON.stringify(failureResponse.data);
                }
                return result;
            }

            return {
                error: MessageFor(failureResponse)
            }
        }


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
                Delete: Delete,
                $crudService: {
                    SuccessResponse: StandardSuccess,
                    FailureResponse: StandardFailure
                }
            };

            return self;


            function ThenCallback(promise, callback) {
                if (_.isFunction(callback)) {
                    promise.then(function (successResponse) {
                        callback(StandardSuccess(successResponse));
                    }, function (failureResponse) {
                        callback(StandardFailure(failureResponse));
                    });
                }
            }


            function List(callback) {
                var promise = my.$http.get(config.endpointList || config.endpoint);
                ThenCallback(promise, callback);
                return promise;
            }


            function Create(data, callback) {
                var promise = my.$http.post(config.endpointCreate || config.endpoint, data);
                ThenCallback(promise, callback);
                return promise;
            }


            function Read(id, callback) {
                var promise = my.$http.get((config.endpointRead || config.endpoint) + id);
                ThenCallback(promise, callback);
                return promise;
            }


            function Update(id, data, callback) {
                var promise = my.$http.put((config.endpointUpdate || config.endpoint) + id, data);
                ThenCallback(promise, callback);
                return promise;
            }


            function Delete(id, callback) {
                var promise = my.$http.delete((config.endpointDelete || config.endpoint) + id);
                ThenCallback(promise, callback);
                return promise;
            }
        }
    }

})();
