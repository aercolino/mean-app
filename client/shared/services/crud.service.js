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
            config: _.mapValues(DefaultConfig(), 'default');,
            Config: Config,
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


        function Config(what) {
            if (_.isPlainObject(what)) {
                // set
                what = _.pick(what, _.keys(DefaultConfig()));
                self.config = _.assign(self.config, what);
                _.forEach(_.mapValues(DefaultConfig(), 'filter'), function (filter, key) {
                    if (_.isFunction(filter)) {
                        self.config[key] = filter(self.config[key]);
                    }
                });
                return self;
            }
            else if (_.isString(what)) {
                // get
                return self.config[what];
            }
            else {
                throw new Error('Expected an object to set or a string to get the value of a config property.');
            }
        }


        function List(callback) {
            my.$http
                .get(self.config.endpointList || self.config.endpoint)
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
                .post(self.config.endpointCreate || self.config.endpoint, data)
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
                .get((self.config.endpointRead || self.config.endpoint) + id)
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
                .put((self.config.endpointUpdate || self.config.endpoint) + id, data)
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
                .delete((self.config.endpointDelete || self.config.endpoint) + id)
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
