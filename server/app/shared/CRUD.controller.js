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
            .all((fields || []).map(Filter))
            .then(callback)
            .catch(function (error) {
                console.log(error);
            });


        function Filter(field) {
            var result;

            switch (typeof field) {

                case 'string':
                    result = {
                        name: field,
                        value: data[field]
                    };
                    break;

                case 'function':
                    var matches = String(field).match(/^function\s*\(\s*(\w+)\s*\)/);
                    if (!(matches && matches[1])) {
                        console.log('Expected a function with only one argument.');
                        return;
                    }
                    result = {
                        name: matches[1],
                        value: field(data[matches[1]])
                    };
                    if (stuff.IsPromise(result.value)) {
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

        Item.find(function(err, items) {

            if (err) {
                return res.send(err);
            }

            res.json(items);

        });

    }



    function Create(req, res) {

        FilterFields(fields, req.body, function (fFields) {
            var item = new Item();

            fFields.forEach(function (fField) {
                item[fField.name] = fField.value;
            });

            item.save(function(err) {

                if (err) {
                    return res.send(err);
                }

                res.json({
                    message: 'Item created!'
                });

            });
        });

    }



    function Read(req, res) {

        Item.findById(req.params.item_id, function(err, item) {

            if (err) {
                return res.send('Expected a valid id: ' + err.message);
            }

            res.json(item);

        });

    }



    function Update(req, res) {

        Item.findById(req.params.item_id, function(err, item) {

            if (err) {
                return res.send('Expected a valid id: ' + err.message);
            }

            if (!item) {
                return res.send('Expected a valid id.');
            }

            FilterFields(req.body, function (fFields) {

                fFields.forEach(function (fField) {
                    item[fField.name] = fField.value;
                });

                item.save(function(err) {
                    if (err) {
                        return res.send(err);
                    }
                    res.json({
                        message: 'Item updated!'
                    });
                });

            });

        });

    }



    function Delete(req, res) {

        Item.remove({
            _id: req.params.item_id
        }, function(err, item) {

            if (err) {
                return res.send('Expected a valid id: ' + err.message);
            }

            res.json({
                message: 'Item deleted!'
            });

        });

    }

}
