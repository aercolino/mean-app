'use strict';

module.exports = CRUD_Controller;

function CRUD_Controller(Item, fields) {

    var Promise = require('es6-promise').Promise;
    var stuff = require('./stuff');

    var self = {
        List:   List,
        Create: Create,
        Read:   Read,
        Update: Update,
        Delete: Delete
    };

    return self;



    function FilterFields(fields, data, callback) {

        Promise
            .all((fields || []).map(Filter).filter(function (field) { return field; }))
            .then(callback)
            .catch(function (error) {
                console.log(error);
            });


        function Filter(field) {
            var result;

            switch (typeof field) {

                case 'string':
                    result = data[field] ? {
                        name: field,
                        value: data[field]
                    } : undefined;
                    break;

                case 'function':
                    var matches = String(field).match(/^function\s*\(\s*(\w+)\s*\)/);
                    if (!(matches && matches[1])) {
                        log.warn('Expected a function with only one argument.');
                        return;
                    }
                    result = data[matches[1]] ? {
                        name: matches[1],
                        value: field(data[matches[1]])
                    } : undefined;
                    if (result && stuff.IsPromise(result.value)) {
                        var promise = new Promise(function (resolve, reject) {
                            var name = result.name;
                            result.value.then(function (value) {
                                resolve({
                                    name: name,
                                    value: value
                                });
                            }).catch(function (error) {
                                reject(Error(error));
                            });
                        });
                        result = promise;
                    }
                    break;

            }

            return result;
        }

    }



    function List(req, res) {

        Item.find(function(error, items) {

            if (error) {
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            stuff.SendSuccess(res, items, items.length + ' items');

        });

    }



    function Create(req, res) {

        FilterFields(fields, req.body, function (fFields) {
            var item = new Item();

            fFields.forEach(function (fField) {
                item[fField.name] = fField.value;
            });

            item.save(function(error) {

                if (error) {
                    return stuff.SendFailure(res, error, 'Bad Request');
                }

                stuff.SendSuccess(res, item._id, Item.modelName + ' created!');

            });
        });

    }



    function Read(req, res) {

        Item.findById(req.params.item_id, function(error, item) {

            if (error) {
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            stuff.SendSuccess(res, item);

        });

    }



    function Update(req, res) {

        Item.findById(req.params.item_id, function(error, item) {

            if (error) {
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            if (!item) {
                error = 'Expected a valid id.';
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            function UpdateItem() {
                FilterFields(fields, req.body, function (fFields) {

                    fFields.forEach(function (fField) {
                        item[fField.name] = fField.value;
                    });

                    item.save(function(error) {

                        if (error) {
                            return stuff.SendFailure(res, error, 'Bad Request');
                        }

                        return stuff.SendSuccess(res, null, Item.modelName + ' updated!');

                    });

                });
            }

            if (self.AllowUpdate) {
                Promise.resolve(self.AllowUpdate(item, req))
                    .then(function (allowed) {
                        if (! allowed) {
                            var error = req.currentUser.name + ' cannot update ' + item.constructor.modelName + ' ' + item.id;
                            return stuff.SendFailure(res, error, 'Unauthorized');
                        }
                        UpdateItem();
                    })
                    .catch(function (error) {
                        return stuff.SendFailure(res, error, 'Bad Request');
                    });
            } else {
                UpdateItem();
            }

        });

    }



    function Delete(req, res) {

        Item.remove({
            _id: req.params.item_id
        }, function(error, numDeletions) {

            if (error) {
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            var message = numDeletions ? Item.modelName + ' deleted!' : 'No ' + Item.modelName.toLowerCase() + ' to delete!';
            stuff.SendSuccess(res, numDeletions, message);

        });

    }

}
