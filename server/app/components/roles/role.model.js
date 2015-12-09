'use strict';

var mongoose = require('mongoose');

var schema   = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    // User, Bear, ...
    model: {
        type: String,
        required: true
    },

    // If restriction is a JSON,             then an item of model has this role if model.count(Extend({_id: item._id}, restriction)).
    // If restriction is a non-empty string, then an item of model has this role if restriction(subject, object).
    // If restriction is FALSEy,             then an item of model has this role if item.roles.contains(name).
    // If restriction is TRUEy,              then an item of model has this role. (not very useful...)
    restriction: mongoose.Schema.Types.Mixed,
    
    valid_from: Date,
    valit_to: Date
});

module.exports = mongoose.model('Role', schema);
