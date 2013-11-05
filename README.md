# Rivulet Client

[![Build Status](https://travis-ci.org/bthesorceror/rivulet_client.png?branch=master)](https://travis-ci.org/bthesorceror/rivulet_client)

[![NPM](https://nodei.co/npm-dl/rivulet_client.png)](https://nodei.co/npm/rivulet_client/)

[![NPM](https://nodei.co/npm/rivulet_client.png?downloads=true)](https://nodei.co/npm/rivulet_client/)

Allows you to connect to a [Journeyman](http://github.com/bthesorceror/journeyman) server with [Rivulet](http://github.com/bthesorceror/rivulet). Use with browserify for client side code.

## Server

```javascript

var Journeyman = require('journeyman');
var Rivulet = require('rivulet');

var server = new Journeyman(3000);
var rivulet = new Rivulet();

server.listen();

rivulet.send("boom", { name: 'brandon' });
rivulet.send("boom", { name: 'ted' }, 'private');

```

## Client:

```javascript

var RivuletClient = require('rivulet_client');

var client = new RivuletClient('/rivulets/boom');

client.on('data', function(person) {
  console.log('My name is ' + person.name);
});

client.on('private', function(person) {
  console.log(person.name + " sent you a private message");
});

client.on('connect', function() {
  console.log('You have connected');
});

```

## Notes

Client will automatically reconnect on a disconnection. To fully disconnect
use the client's disconnect method directly.

## Caveat

If you are using this library outside the client, you must pass the full path
i.e. http://localhost:3000/rivulets/boom.

