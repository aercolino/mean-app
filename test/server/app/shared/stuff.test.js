var assert = require('assert');
var color = require(__filename.replace(/^(.*?)\/test\//, '$1/').replace(/\.test\.js$/, '.js')).color;

describe('ColorFactory', function() {

    describe('Painting', function() {

        it('should return the colored string when painting an uncolored string', function() {
            assert.equal(color.RED + 'string' + color.DEFAULT, color.Red('string'));
        });

        it('should return the uncolored string when defaulting a colored string', function() {
            assert.equal('string', color.Default(color.RED + 'string' + color.DEFAULT));
        });

        it('should return the 2-colors string when painting a 1-color string', function() {
            assert.equal(color.BLUE + 'before' + color.RED + 'string' + color.BLUE + 'after' + color.DEFAULT, 
                color.Blue('before' + color.RED + 'string' + color.DEFAULT + 'after'));

            assert.equal(color.RED + 'string' + color.BLUE + 'after' + color.DEFAULT, 
                color.Blue(color.RED + 'string' + color.DEFAULT + 'after'));

            assert.equal(color.BLUE + 'before' + color.RED + 'string' + color.DEFAULT, 
                color.Blue('before' + color.RED + 'string' + color.DEFAULT));

            assert.equal(color.BLUE + 'before' + color.RED + 'string' + color.BLUE + 'middle' + color.GREEN + 'string' + color.BLUE + 'after' + color.DEFAULT, 
                color.Blue('before' + color.RED + 'string' + color.DEFAULT + 'middle' + color.GREEN + 'string' + color.DEFAULT + 'after'));
        });

        it('should color a number', function() {
            assert.equal(color.RED + '1234' + color.DEFAULT, color.Red(1234));
        });

    });

});
