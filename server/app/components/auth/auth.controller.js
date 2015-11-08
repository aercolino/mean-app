'use strict';

var Extend = require('util')._extend;
var jsonWT = require('jsonwebtoken');
var User = require(global.absPath + '/app/components/users/user.model');
var Hash = require(global.absPath + '/app/components/auth/hash');
var config = require(global.absPath + '/app/config');
var stuff = require(global.absPath + '/app/shared/stuff');

var self = {
    VerifyCredentials: VerifyCredentials,
    VerifyToken: VerifyToken
};

module.exports = self;

return;



function VerifyCredentials(req, res) {
    User.findOne({
        name: req.body.name
    }).select('password').exec(function(error, user) {

        if (error) {
            return stuff.SendFailure(res, error, 'Bad Request');
        }

        if (!user) {
            return stuff.SendFailure(res, 'Authentication failed. Wrong name.', 'Unauthorized');
        }

        var options = Extend({}, user.password);
        delete options.key;
        options.plaintext = req.body.password;
        Hash(options, function(error, result) {

            if (error) {
                return stuff.SendFailure(res, error, 'Bad Request');
            }

            if (user.password.key != result.key) {
                return stuff.SendFailure(res, 'Authentication failed. Wrong password.', 'Unauthorized');
            }

            var simplified = {
                _id: user._id,
                name: user.name
            };
            var token = jsonWT.sign(simplified, config.secret, {
                expiresIn: "10h"
            });
            stuff.SendSuccess(res, token);

        });

    });
}



function VerifyToken(req, res, next) {
    var token = req.params[0] || req.headers['x-access-token'];
    var httpError = stuff.httpStatusCode[req.params[0] ? 'Bad Request' : 'Forbidden'];

    if (!token) {
        return stuff.SendFailure(res, 'Authentication failed. No token.', httpError);
    }

    jsonWT.verify(token, config.secret, function(error, simplified) {

        if (error) {
            return stuff.SendFailure(res, 'Authentication failed. Wrong token.', httpError);
        }

        User.findOne({
            _id: simplified._id
        }, function(error, user) {

            if (error) {
                return stuff.SendFailure(res, 'Authentication failed. Wrong user.', httpError);
            }

            req.currentUser = user;

            if (req.params[0]) {
                return stuff.SendSuccess(res, req.currentUser.name);
            }

            next();
        });
    });
}
