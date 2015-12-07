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
                        console.log('Expected a function with only one argument.');
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
                return res.json(stuff.Failure(error));
            }

            res.json(stuff.Success(items, items.length + ' items'));

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
                    return res.json(stuff.Failure(error));
                }

                res.json(stuff.Success(item._id, Item.modelName + ' created!'));

            });
        });

    }



    function Read(req, res) {

        Item.findById(req.params.item_id, function(error, item) {

            if (error) {
                return res.json(stuff.Failure(error));
            }

            res.json(stuff.Success(item));

        });

    }



    function Update(req, res) {

        Item.findById(req.params.item_id, function(error, item) {

            if (error) {
                return res.json(stuff.Failure(error));
            }

            if (!item) {
                return res.json(stuff.Failure('Expected a valid id.'));
            }

            function update() {
                FilterFields(fields, req.body, function (fFields) {

                    fFields.forEach(function (fField) {
                        item[fField.name] = fField.value;
                    });

                    item.save(function(error) {

                        if (error) {
                            return res.json(stuff.Failure(error));
                        }

                        res.json(stuff.Success(null, Item.modelName + ' updated!'));

                    });

                });
            }

            if (self.allowUpdate) {
                Promise.resolve(self.allowUpdate(item, req))
                    .then(function (allowed) {
                        if (allowed) {
                            update();
                        } else {
                            res.json(stuff.Failure(req.currentUser.name + ' cannot update ' + item.constructor.modelName + ' ' + item.id));
                        }
                    })
                    .catch(function (error) {
                        res.json(stuff.Failure(error));
                    });
            } else {
                update();
            }

        });

    }



    function Delete(req, res) {

        Item.remove({
            _id: req.params.item_id
        }, function(error, numDeletions) {

            if (error) {
                return res.json(stuff.Failure(error));
            }

            res.json(stuff.Success(numDeletions, 
                numDeletions ? Item.modelName + ' deleted!' : 'No ' + Item.modelName.toLowerCase() + ' to delete!'));

        });

    }

}
