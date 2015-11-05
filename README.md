# mean-app

See also: http://andowebsit.es/blog/noteslog.com/post/how-to-improve-filters-with-promises/


## Server Install / Run

    $ cd server
    $ npm install
    $ node start


## Server API

### Login
Returns a [JSON Web Token](https://github.com/auth0/node-jsonwebtoken) for verified credentials.

    POST localhost:8080/auth/login {
        name: "<NAME>", 
        password: "<PASSWORD>"
    }

Success:

    {
      "success": true,
      "message": "Enjoy your token!",
      "token": "<TOKEN>"
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

### Token Verification
Returns a response.success == true for a verified token.

    GET, POST localhost:8080/auth/verify?token=<TOKEN>
    GET, POST localhost:8080/auth/verify/<TOKEN>
    POST localhost:8080/auth/verify {
        token: <TOKEN>
    }

Success:

    {
      "success": true,
      "message": "Enjoy your access!"
    }

Failures:

    {
        "success": false,
        "message": "No token provided."
    }

    {
        "success": false,
        "message": "Authentication failed. Wrong token."
    }

