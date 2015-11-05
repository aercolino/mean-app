
module.exports = AuthController();

function AuthController() {
    var extend = require('util')._extend;
    var jsonWT = require('jsonwebtoken');
    var User   = require(global.absPath + '/app/components/users/user.model');
    var Hash   = require(global.absPath + '/app/components/auth/hash');
    var config = require(global.absPath + '/app/config');

    var self = {
        authenticateCredentials: Authenticate,
        verifyToken: Verify
    };

    return self;



    function SendToken(res, user) {
        var simplified = {
            _id:  user._id,
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
    } 



    function Authenticate(req, res) {
        User.findOne({
            name: req.body.name
        }, function(error, user) {

            if (error) {
                throw error;
            }

            if (!user) {
                return res.json({
                    success: false,
                    message: 'Authentication failed. User not found.'
                });
            }

//            return SendToken(res, user);  // TODO: comment out this line ASAP

            var options = extend({}, user.password);
            delete options.key;
            options.plaintext = req.body.password;
            Hash(options, function (error, result) {

                if (error) {
                    throw error;
                }

                if (user.password.key != result.key) {
                    return res.json({
                        success: false,
                        message: 'Authentication failed. Wrong password.'
                    });
                }

                SendToken(res, user);

            });

        });
    }



    function Verify(req, res, next) {
        var token = req.body.token || req.query.token || req.params.token || req.headers['x-access-token'];
        if (!token) {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
        jsonWT.verify(token, config.secret, function(err, simplified) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            }
            req.user = simplified;
            console.log("Access granted to user '%s'.", req.user.name);
            if (typeof next == 'function') {
                next();
            }
        });
    }
}
