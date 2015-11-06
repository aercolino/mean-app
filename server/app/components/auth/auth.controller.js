'use strict';

module.exports = AuthController();

function AuthController() {
    var Extend = require('util')._extend;
    var jsonWT = require('jsonwebtoken');
    var User = require(global.absPath + '/app/components/users/user.model');
    var Hash = require(global.absPath + '/app/components/auth/hash');
    var config = require(global.absPath + '/app/config');

    var self = {
        VerifyCredentials: VerifyCredentials,
        VerifyToken: VerifyToken
    };

    return self;



    function VerifyCredentials(req, res) {
        User.findOne({
            name: req.body.name
        }, function(error, user) {

            if (error) {
                throw error;
            }

            if (!user) {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Wrong name.'
                });
            }

            var options = Extend({}, user.password);
            delete options.key;
            options.plaintext = req.body.password;
            Hash(options, function(error, result) {

                if (error) {
                    throw error;
                }

                if (user.password.key != result.key) {
                    return res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                }

                var simplified = {
                    _id: user._id,
                    name: user.name
                };
                var token = jsonWT.sign(simplified, config.secret, {
                    expiresIn: "10h"
                });
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });

            });

        });
    }



    function VerifyToken(req, res, next) {
        var token = req.headers['x-access-token'] || req.body.token || req.query.token || req.params[0];
        var isBackgroundVerification = !!req.headers['x-access-token'];

        if (!token) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

        jsonWT.verify(token, config.secret, function(error, simplified) {

            if (error) {
                return res.json({
                    success: false,
                    message: 'Authentication failed. Wrong token.'
                });
            }

            User.findOne({
                _id: simplified._id
            }, function(error, user) {
            
                if (error) {
                    return res.json({
                        success: false,
                        message: 'Authentication failed. Wrong user.'
                    });
                }

                req.current_user = user;
                console.log("Access granted to user '%s'.", req.current_user.name);
                if (!isBackgroundVerification) {
                    return res.json({
                        success: true,
                        message: 'Enjoy your access, ' + req.current_user.name + '!'
                    });
                }

                next();
            });
        });
    }
}
