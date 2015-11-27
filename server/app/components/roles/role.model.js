'use strict';

var mongoose = require('mongoose');

var schema   = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    // User, Bear, ...
    modelName: {
        type: String,
        required: true
    },

    // If condition is a JSON,             then an item of model has this role if model.count(Extend({_id: item._id}, condition)).
    // If condition is a non-empty string, then an item of model has this role if condition(item, name).
    // If condition is FALSEy,             then an item of model has this role if item.roles.contains(name).
    // If condition is TRUEy,              then an item of model has this role. (not very useful...)
    restriction: mongoose.Schema.Types.Mixed,
    
    valid_from: Date,
    valit_to: Date
});

module.exports = mongoose.model('Role', schema);
