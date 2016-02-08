'use strict';

// BASE SETUP
// =============================================================================

global.skipAuth = !true;

var path = require('path');

global.absPath = __dirname;
global.clientPath = path.resolve(absPath + '/../client');

global.log = require('loglevel');
log.setLevel(log.levels.DEBUG);

var port = process.env.PORT || 8080;

var config = require('./app/config');

var Express = require('express');
var app     = Express();

var MethodOverride = require('method-override');
app.use(MethodOverride());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

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

// auth app
app.get('/auth', function(req, res) {
    res.sendfile(clientPath + '/apps/auth/index.html');
});

// core app
app.get('/core', function(req, res) {
    res.sendfile(clientPath + '/apps/core/index.html');
});

// catch all to serve client files
app.get('*', function(req, res) {
    res.sendfile(clientPath + req.url.replace(/\?.*/, ''));
});


// START THE SERVER
// =============================================================================
app.listen(port);
var color = require('./app/shared/stuff').color;
console.log('Magic happens on port ' + color.Purple(port) + ' since ' + (new Date));
