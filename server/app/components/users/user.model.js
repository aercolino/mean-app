'use strict';

var mongoose = require('mongoose');

var schema   = new mongoose.Schema({
    name: String,
    password: {
        algorithm:  String,
        digest:     String,
        iterations: Number,
        salt:       String,
        key:        String
    },
    admin: Boolean
});

module.exports = mongoose.model('User', schema);
