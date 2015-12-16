'use strict';

// TODO: review error management, maybe creating Errors with stuff.DefineError
// TODO: add support for setting a custom priority at which to check a permission
// TODO: add support for breaking out of the chain of permissions to check
// TODO: add support for negation like: 'HandcuffedPeople CANTedit TheirStuff'

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

            CompileActor(permission.subject.name, permissions[name]),
            CompileAction(permission.action.name, permissions[name]),
            CompileActor(permission.object.name,  permissions[name])

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
                        log.debug('Permission "' + that.name + '": actions' + (actionsMatch ? '' : " don't") + ' match');
                        if (! actionsMatch) {
                            return false;
                        }
                        return that.subject.matches(subject, object);
                    })
                    .then(function (subjectsMatch) {
                        log.debug('Permission "' + that.name + '": subjects' + (subjectsMatch ? '' : " don't") + ' match');
                        if (! subjectsMatch) {
                            return false;
                        }
                        return that.object.matches(subject, object);
                    })
                    .then(function (objectsMatch) {
                        log.debug('Permission "' + that.name + '": objects' + (objectsMatch ? '' : " don't") + ' match');
                        resolve(objectsMatch ? that.name : false);
                    })
                    .catch(function (error) {
                        reject(error instanceof Error ? error : new Error(error));
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



    function HasModel(item, modelName) {
        // Turn modelName to a real RegExp if it looks like one
        if (TypeOf(modelName) === 'String' && modelName[0] === '/') {
            var parts = modelName.match(/\/([^\/]+)\/([gimy]*)/);
            if (! parts) {
                throw new Error('Expected a model name or a regular expression. "' + modelName + '" given instead.');
            }
            modelName = new RegExp(parts[1], parts[2]);
        }
        return item.constructor.modelName.replace(modelName, '') === '';
    }



    function CompileItem(itemName, permissionValue) {
        var descriptor = permissionValue[itemName];
        var errorMessage = '';
        switch (TypeOf(descriptor)) {
            case 'String':
            case 'RegExp':
                descriptor = {
                    model: descriptor,
                };
            break;
            case 'Object':
                switch (TypeOf(descriptor.model)) {
                    case 'String':
                    case 'RegExp':
                    break;
                    default:
                        errorMessage = 'Type of model of item "' + itemName + '" must be String or RegExp.';
                    break;
                }
                switch (TypeOf(descriptor.restriction)) {
                    case 'undefined':
                    case 'Function':
                    break;
                    default:
                        errorMessage = 'Type of restriction of item "' + itemName + '" must be undefined or Function.';
                    break;
                }
            break;
            default:
                errorMessage = 'Type of item "' + itemName + '" must be Object, String, or RegExp.';
            break;
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        descriptor.complexity = descriptor.restriction ? 1 : 0;
        descriptor.matches = function (subject, object) {
            var item = this.actor == 'subject' ? subject : object;
            if (! HasModel(item, this.model)) {
                return false;
            }
            var result = ! this.restriction || this.restriction(subject, object);
            return result;
        };
        return descriptor;
    }



    function CompileRole(roleName, permissionValue) {
        return new Promise(function (resolve, reject) {
            var descriptor = permissionValue[roleName];
            if (descriptor) {
                var errorMessage = 'Role "' + roleName + '" cannot be defined in a permission.';
                throw new Error(errorMessage);
            }
            var Role = require(absPath + '/app/components/roles/role.model');
            Role.findOne({name: roleName}, function (error, role) {
                if (error) {
                    return reject(error instanceof Error ? error : new Error(error));
                }
                if (! role) {
                    return reject(new Error('No role "' + roleName + '" found.'));
                }
                descriptor = {
                    model: role.model
                };
                switch (TypeOf(role.restriction)) {
                    case 'Object':
                        descriptor.complexity = 2;
                        descriptor.matches = function (subject, object) {
                            return new Promise(function (resolve, reject) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! HasModel(item, this.model)) {
                                    return false;
                                }
                                var criteria = Extend(role.restriction, {id: item.id});
                                var Item = item.collection;
                                Item.count(criteria, function(error, result) {
                                    if (error) {
                                        return reject(error instanceof Error ? error : new Error(error));
                                    }
                                    if (result > 1) {
                                        return reject(new Error('Data Corruption: id:' + item.id + ' identifies ' + result + ' documents.'));
                                    }
                                    resolve(result === 1);
                                });
                            });
                        };
                    break;
                    case 'String':
                        descriptor.complexity = 1;
                        descriptor.matches = function (subject, object) {
                            var item = this.actor == 'subject' ? subject : object;
                            if (! HasModel(item, this.model)) {
                                return false;
                            }
                            var result = !!Apply(role.restriction, [subject, object]);
                            return result;
                        };
                    break;
                    default:
                        descriptor.complexity = 0;
                        if (role.restriction) {
                            descriptor.matches = function (subject, object) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! HasModel(item, this.model)) {
                                    return false;
                                }
                                return true;
                            };
                        } else {
                            descriptor.matches = function (subject, object) {
                                var item = this.actor == 'subject' ? subject : object;
                                if (! HasModel(item, this.model)) {
                                    return false;
                                }
                                var result = TypeOf(item.roles) == 'Array' && item.roles.indexOf(role.name) > -1;
                                return result;
                            };
                        }
                    break;
                }
                resolve(descriptor);
            });
        });
    }



    function CompileActor(actorName, permissionValue) {
        var kind = actorName.search(/^[a-z]/) === 0 ? 'item' : 'role';
        var descriptor;
        switch (kind) {
            case 'item':  // final
                descriptor = CompileItem(actorName, permissionValue);
            break;
            case 'role':  // promise
                descriptor = CompileRole(actorName, permissionValue);
            break;
        }
        return descriptor;
    }



    function CompileAction(actionName, permissionValue) {
        var descriptor = permissionValue[actionName];
        var errorMessage = '';
        switch (TypeOf(descriptor)) {
            case 'undefined':
                descriptor = {
                    value: actionName
                };
            break;
            case 'RegExp':
                descriptor = {
                    value: descriptor
                };
            break;
            default:
                errorMessage = 'Type of action "' + actionName + '" must be undefined or RegExp.';
            break;
        }
        if (errorMessage) {
            throw new Error(errorMessage);
        }
        descriptor.matches = function (action) {
            return action.replace(this.value, '') === '';
        };
        return descriptor;
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
                callback(error instanceof Error ? error : new Error(error));
            });
    }

    return promise;
}
