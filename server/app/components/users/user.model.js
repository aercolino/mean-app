'use strict';

var mongoose = require('mongoose');

var schema   = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: {
            algorithm:  String,
            digest:     String,
            iterations: Number,
            salt:       String,
            key:        String
        },
        required: true,
        select: false
    },
    roles: []
});

module.exports = mongoose.model('User', schema);
