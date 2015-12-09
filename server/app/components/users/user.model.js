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
    owner_id: mongoose.Schema.Types.ObjectId,
    roles: [String]
});

schema.methods.isAdmin = function () {
    var result = this.roles.indexOf('Admin') > -1;
    return result;
};

schema.statics.owns = function (anybody, theirStuff) { 
    return theirStuff.owner_id && (theirStuff.owner_id === anybody.id);
};

var self = mongoose.model('User', schema);
module.exports = self;
