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
            return res.status(stuff.httpStatusCode['Bad Request']).json(stuff.Failure(error));
        }

        if (!user) {
            return res.status(stuff.httpStatusCode['Unauthorized']).json(stuff.Failure('Authentication failed. Wrong name.'));
        }

        var options = Extend({}, user.password);
        delete options.key;
        options.plaintext = req.body.password;
        Hash(options, function(error, result) {

            if (error) {
                return res.status(stuff.httpStatusCode['Bad Request']).json(stuff.Failure(error));
            }

            if (user.password.key != result.key) {
                return res.status(stuff.httpStatusCode['Unauthorized']).json(stuff.Failure('Authentication failed. Wrong password.'));
            }

            var simplified = {
                _id: user._id,
                name: user.name
            };
            var token = jsonWT.sign(simplified, config.secret, {
                expiresIn: "10h"
            });
            res.json(stuff.Success(token));

        });

    });
}



function VerifyToken(req, res, next) {
    var token = req.headers['x-access-token'] || req.params[0];
    var httpError = stuff.httpStatusCode[req.headers['x-access-token'] ? 'Forbidden' : 'Bad Request'];

    if (!token) {
        return res.status(httpError).json(stuff.Failure('Authentication failed. No token.'));
    }

    jsonWT.verify(token, config.secret, function(error, simplified) {

        if (error) {
            return res.status(httpError).json(stuff.Failure('Authentication failed. Wrong token.'));
        }

        User.findOne({
            _id: simplified._id
        }, function(error, user) {
        
            if (error) {
                return res.status(httpError).json(stuff.Failure('Authentication failed. Wrong user.'));
            }

            req.current_user = user;
            console.log("Access granted to '%s'.", req.current_user.name);

            if (!req.headers['x-access-token']) {

                return res.json(stuff.Success(req.current_user.name, 'Access granted.'));

            }

            next();
        });
    });
}
