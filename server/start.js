'use strict';

// BASE SETUP
// =============================================================================

global.skipAuth = !true;
global.absPath = __dirname;
var port = process.env.PORT || 8080;

var Express = require('express');
var app     = Express();

var config = require('./app/config');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var Morgan = require('./app/shared/stuff').Morgan;
app.use(Morgan(':date[iso] :current-user :method :url :status :response-time ms - :res[content-length] bytes'));

var mongoose   = require('mongoose');
mongoose.connect(config.database);

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});



// ROUTES
// =============================================================================
app.use('/api/tokens', require('./app/components/auth/auth.routes'));

app.use('/api/bears',  require('./app/components/bears/bear.routes'));

app.use('/api/users',  require('./app/components/users/user.routes'));



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port + ' since ' + (new Date));
