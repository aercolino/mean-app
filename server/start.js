
// BASE SETUP
// =============================================================================

global.absPath = __dirname;
var port = process.env.PORT || 8080;

var express = require('express');
var app     = express();

var bodyParser = require('body-parser');
var morgan     = require('morgan');
var mongoose   = require('mongoose');

var config = require('./app/config');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
mongoose.connect(config.database);

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});



// ROUTES
// =============================================================================
app.use('/auth',      require('./app/components/auth/auth.routes'));

app.use('/api/bears', require('./app/components/bears/bear.routes'));

app.use('/api/users', require('./app/components/users/user.routes'));



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
