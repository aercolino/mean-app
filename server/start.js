'use strict';

// BASE SETUP
// =============================================================================

global.skipAuth = !true;
global.absPath = __dirname;

global.log = require('loglevel');
log.setLevel(log.levels.DEBUG);

var port = process.env.PORT || 8080;

var Express = require('express');
var app     = Express();

var config = require('./app/config');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var Morgan = require('./app/shared/stuff').Morgan;
app.use(Morgan(':date[iso] :current-user[colored] :method :url :status[colored] :response-time ms - :res[content-length] bytes'));

var mongoose = require('mongoose');
mongoose.connect(config.database);

global.Can = require('./app/components/permissions/permission.model').Can;

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});



// ROUTES
// =============================================================================
app.use('/api/tokens', require('./app/components/auth/auth.routes'));

app.use('/api/bears',  require('./app/components/bears/bear.routes'));

app.use('/api/roles',  require('./app/components/roles/role.routes'));

app.use('/api/users',  require('./app/components/users/user.routes'));



// START THE SERVER
// =============================================================================
app.listen(port);
var color = require('./app/shared/stuff').color;
console.log('Magic happens on port ' + color.Purple(port) + ' since ' + (new Date));
