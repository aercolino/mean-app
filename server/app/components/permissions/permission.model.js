'use strict';

// TODO: allow definitions to say that a permission is to be checked at a given priority
// TODO: allow definitions to say that a permission is the last one to be checked before giving up
// TODO: allow definitions to say that a permission denies action to matching actors, example: 'HandcuffedPeople CANTedit TheirStuff'

var Promise = require('es6-promise').Promise;
var TypeOf  = require(absPath + '/app/shared/stuff').TypeOf;
var Apply   = require(absPath + '/app/shared/stuff').Apply;
var Find    = require(absPath + '/app/shared/stuff').ArrayFind;
var Extend  = require('util')._extend;

var source = require('./permissions');
var permissions = Compile(source);

var self = {
    Can: Can
};

module.exports = self;

return;



function Compile(permissions) {
    var result = {
        'String': {},
        'RegExp': []
    };
    Object.keys(permissions).forEach(function (name) {
        var matches = name.split(/\s+(can[A-Z][\w-]*)\s+/);
        if (! matches) {
            return;
        }
        var permission = {
            name:    name,
            subject: {name: matches[0], actor: 'subject'},
            action:  {name: matches[1]},
            object:  {name: matches[2], actor: 'object'}
        };

        Promise.all([

            normalizeActor(permission.subject.name, permissions[name]),
            normalizeAction(permission.action.name, permissions[name]),
            normalizeActor(permission.object.name,  permissions[name])

        ]).then(function(defs) {

            permission.subject = Extend(defs[0] || {}, permission.subject);
            permission.action  = Extend(defs[1] || {}, permission.action);
            permission.object  = Extend(defs[2] || {}, permission.object);

            permission.matches = function (subject, action, object) {

                var that = this;
                return new Promise(function (resolve, reject) {

                    Promise
                    .resolve(that.action.matches(action))
                    .then(function (actionsMatch) {
                        log.debug('Permission ' + that.name + ': actions' + (actionsMatch ? '' : " don't") + ' match');
                        if (! actionsMatch) {
                            return false;
                        }
                        return that.subject.matches(subject, object);
                    })
                    .then(function (subjectsMatch) {
                        log.debug('Permission ' + that.name + ': subjects' + (subjectsMatch ? '' : " don't") + ' match');
                        if (! subjectsMatch) {
                            return false;
                        }
                        return that.object.matches(subject, object);
                    })
                    .then(function (objectsMatch) {
                        log.debug('Permission ' + that.name + ': objects' + (objectsMatch ? '' : " don't") + ' match');
                        resolve(objectsMatch ? that : false);
                    })
                    .catch(function (err) {
                        reject(err);
                    });

                });

            };
        
            switch (TypeOf(permission.action.value)) {
                case 'String':
                    result.String[permission.action.name] = result.String[permission.action.name] || [];
                    result.String[permission.action.name].push(permission);
                break;
                case 'RegExp':
                    result.RegExp.push(permission);
                break;
            }
            

        }).catch(function(reason) {
            console.log(reason + '\n-- Ignoring permission "' + name + '".');
        });
    });

    return result;



    function hasModel(item, model) {
        // Turn model to a real RegExp if it looks like one
        if (TypeOf(model) === 'String' && model[0] === '/') {
            var parts = model.match(/\/([^\/]+)\/([gimy]*)/);
            if (! parts) {
                throw new Error('Expected a model name or a regular expression. "' + model + '" given instead.');
            }
            model = new RegExp(parts[1], parts[2]);
        }
        return item.constructor.modelName.replace(model, '') === '';
    }



    function normalizeActorItem(name, definition) {
        var def = definition[name];
        var err = '';
        switch (TypeOf(def)) {
            case 'String':
            case 'RegExp':
                def = {
                    model: def,
                };
            break;
            case 'Object':
                switch (TypeOf(def.model)) {
                    case 'String':
                    case 'RegExp':
                    break;
                    default:
                        err = 'type of model of item "' + name + '" must be String or RegExp';
                    break;
                }
                switch (TypeOf(def.restriction)) {
                    case 'undefined':
                    case 'Function':
                    break;
                    default:
                        err = 'type of restriction of item "' + name + '" must be undefined or Function';
                    break;
                }
            break;
            default:
                err = 'type of item "' + name + '" must be Object, String, or RegExp';
            break;
        }
        if (err) {
            throw Error(err);
        }
        def.complexity = def.restriction ? 1 : 0;
        def.matches = function (subject, object) {
            var item = this.actor == 'subject' ? subject : object;
            if (! hasModel(item, this.model)) {
                return false;
            }
            var result = ! this.restriction || this.restriction(subject, object);
            return result;
        };
        return def;
    }



    function normalizeActorRole(name, definition) {
        return new Promise(function (resolve, reject) {
            var def = definition[name];
            if (def) {
                var err = 'role "' + name + '" must not be defined';
                throw Error(err);
            }
            var Role = require(absPath + '/app/components/roles/role.model');
            Role.findOne({name: name}, function (err, role) {
                if (err) {
                    return reject(Error(err));
                }
                if (! role) {
                    return reject('No role "' + name + '" found.');
                }
                def = {
                    model: role.model
                };
                switch (TypeOf(role.restriction)) {
                    case 'Object':
                        def.complexity = 2;
                        def.matches = function (subject, object) {
                            return new Promise(function (resolve, reject) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! hasModel(item, this.model)) {
                                    return false;
                                }
                                var criteria = Extend(role.restriction, {id: item.id});
                                var Item = item.collection;
                                Item.count(criteria, function(error, result) {
                                    if (error) {
                                        return reject(Error(error));
                                    }
                                    if (result > 1) {
                                        return reject(Error('Data Corruption: id:' + item.id + ' identifies ' + result + ' documents.'));
                                    }
                                    resolve(result === 1);
                                });
                            });
                        };
                    break;
                    case 'String':
                        def.complexity = 1;
                        def.matches = function (subject, object) {
                            var item = this.actor == 'subject' ? subject : object;
                            if (! hasModel(item, this.model)) {
                                return false;
                            }
                            var result = !!Apply(role.restriction, [subject, object]);
                            return result;
                        };
                    break;
                    default:
                        def.complexity = 0;
                        if (role.restriction) {
                            def.matches = function (subject, object) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! hasModel(item, this.model)) {
                                    return false;
                                }
                                return true;
                            };
                        } else {
                            def.matches = function (subject, object) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! hasModel(item, this.model)) {
                                    return false;
                                }
                                var result = TypeOf(item.roles) == 'Array' && item.roles.indexOf(role.name) > -1;
                                return result;
                            };
                        }
                    break;
                }
                resolve(def);
            });
        });
    }



    function normalizeActor(name, definition) {
        var kind = name.search(/^[a-z]/) === 0 ? 'item' : 'role';
        var def;
        switch (kind) {
            case 'item':  // final
                def = normalizeActorItem(name, definition);
            break;
            case 'role':  // promise
                def = normalizeActorRole(name, definition);
            break;
        }
        return def;
    }



    function normalizeAction(name, definition) {
        var def = definition[name];
        var err = '';
        switch (TypeOf(def)) {
            case 'undefined':
                def = {
                    value: name
                };
            break;
            case 'RegExp':
                def = {
                    value: def
                };
            break;
            default:
                err = 'type of action "' + name + '" must be undefined or RegExp';
            break;
        }
        if (err) {
            throw Error(err);
        }
        def.matches = function (action) {
            return action.replace(this.value, '') === '';
        };
        return def;
    }

};



function Can(subject, action, object, callback) {

    if (! (action.search(/^can[A-Z]/) === 0)) {
        action = 'can' + action[0].toUpperCase() + action.substr(1);
    }

    var ps = permissions.String[action].concat(permissions.RegExp);

    var priority = {
        '0': [],
        '1': [],
        '2': [],
        '3': [],
        '4': [],
    };
    ps.forEach(function (p) {
        priority[p.subject.complexity + p.object.complexity].push(p);
    });
    ps = []
        .concat(priority['0'])
        .concat(priority['1'])
        .concat(priority['2'])
        .concat(priority['3'])
        .concat(priority['4']);

    var promise = Find(ps, function (p) {
        return p.matches(subject, action, object);
    });

    if (TypeOf(callback) === 'Function') {
        return promise
            .then(function (p) {
                callback(undefined, p);
            })
            .catch(function (error) {
                callback(error);
            });
    }

    return promise;
}


