// See http://www.boronine.com/2012/08/30/Strong-Password-Hashing-with-Node-Standard-Library/

var crypto = require('crypto');

module.exports = Hash;

return;

function Hash(options, callback) {

    // Default options.plaintext to a random 8-character string
    if (!options.plaintext) {
        return crypto.randomBytes(8, function(err, buf) {
            if (err) {
                return callback(err);
            }
            options.plaintext = buf.toString('base64');
            Hash(options, callback);
        });
    }

    // Default options.salt to a random 64-character string (512 bits)
    if (!options.salt) {
        return crypto.randomBytes(64, function(err, buf) {
            if (err) {
                return callback(err);
            }
            options.salt = buf.toString('base64');
            Hash(options, callback);
        });
    } 

    // Default options.iterations to 10k
    if (!options.iterations) {
        options.iterations = 10000;
    }

    // Default options.digest to sha1
    if (!options.digest) {
        options.digest = 'sha1';
    }

    crypto.pbkdf2(options.plaintext, options.salt, options.iterations, 64, options.digest, function(err, key) {
        if (err) {
            return callback(err);
        }
        options.algorithm = 'PBDFK2';
        options.key = key.toString('base64');
        callback(null, options);
    });

}
