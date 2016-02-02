# mean-app

My documentation

- http://andowebsit.es/blog/noteslog.com/post/how-to-improve-filters-with-promises/
- http://andowebsit.es/blog/noteslog.com/post/how-to-customize-morganjs/

Authentication

- https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
- http://www.html5rocks.com/en/tutorials/es6/promises/

Mongoose

- http://mongoosejs.com/docs/guide.html
- https://github.com/madhums/node-express-mongoose-demo/blob/master/app/models/user.js

Express

- http://expressjs.com/guide/routing.html
- http://expressjs.com/api.html

MEAN

- http://www.ibm.com/developerworks/opensource/library/wa-mean1/index.html

Mocha

- http://mochajs.org/

Instanbul

- https://github.com/gotwarlost/istanbul



## Server Install / Run

    $ cd server
    $ npm install
    $ npm install -g nodemon
    $ nodemon start


## Server API


### Authentication with credentials
Send valid credentials to get a [JSON Web Token](https://github.com/auth0/node-jsonwebtoken).

    POST localhost:8080/api/tokens {
        name: "<NAME>", 
        password: "<PASSWORD>"
    }

Success:

    {
      "success": true,
      "payload": "<TOKEN>"
    }

Failures:

    {
      "success": false,
      "message": "Authentication failed. Wrong name."
    }

    {
      "success": false,
      "message": "Authentication failed. Wrong password."
    }


### Authentication with token
Send a valid token to get authenticated.

    GET localhost:8080/api/tokens/<TOKEN>

Success:

    {
      "success": true,
      "payload": "<User name>",
      "message": "Access granted."
    }

Failures:

    {
        "success": false,
        "message": "Authentication failed. Wrong token."
    }

    {
        "success": false,
        "message": "Authentication failed. Wrong user."
    }


## Tests

### Server side testing
    $ npm install -g mocha
    $ mocha 'test/**/*.js'

### Code coverage
    $ npm install -g istanbul

