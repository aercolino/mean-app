# mean-app

See also: http://andowebsit.es/blog/noteslog.com/post/how-to-improve-filters-with-promises/


## Server Install / Run

    $ cd server
    $ npm install
    $ node start


## Server API

### Login
Returns a JSON Web Token for the verified credentials.

    POST localhost:8080/auth/login {
        name: ..., 
        password: ...
    }

Success:

    {
      "success": true,
      "message": "Enjoy your token!",
      "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NjMxZWFiMTE1NGY5ZDA3MmYwMDAwMDEiLCJuYW1lIjoiQW5kcmVhIiwiaWF0IjoxNDQ2NzIzMDcxLCJleHAiOjE0NDY3NTkwNzF9.2cbAYrzzAowPLEYiW-n6l_zY8kHwcEL0Fw3RSWlBxSA"
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
