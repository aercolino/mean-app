# mean-app

See also: http://andowebsit.es/blog/noteslog.com/post/how-to-improve-filters-with-promises/


## Server Install / Run

    $ cd server
    $ npm install
    $ node start


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

### Code coverage
    $ npm install -g istanbul

