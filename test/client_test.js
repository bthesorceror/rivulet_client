var tape       = require('tape');
var Rivulet    = require('rivulet');
var Journeyman = require('journeyman');
var Client     = require('../');

var close = function(harness) {
  for (var i = 0; i < harness.connections.length; i++) {
    harness.connections[i].destroy();
  }
  harness.server.close();
}

var port = 9090;

function buildHarness(custom_port) {
  var p = custom_port || port++;
  var server = new Journeyman(p);
  var rivulet = new Rivulet();
  var connections = [];

  server.use(rivulet.middleware());

  server.use(function(req, res, next) {
    connections.push(req.socket);
    next();
  });

  server.listen();

  var close = function() {
    server.close();
    for (var i = 0; i < connections.length; i++) {
      connections[i].destroy();
    }
  }

  return {
    port: p,
    server: server,
    rivulet: rivulet,
    connections: connections,
    close: close
  };
}

tape('emits a connect event', function(t) {
  t.plan(1);

  var harness = buildHarness();
  var client = new Client("http://localhost:"+harness.port+"/rivulets/boom");

  client.on('connect', function() {
    setTimeout(function() {
      t.ok(true, 'connect event was fired');
    }, 15);
  });

  t.on('end', function() {
    harness.close();
    client.disconnect();
  });
});

tape('emits a data event', function(t) {
  t.plan(1);

  var harness = buildHarness();
  var client = new Client("http://localhost:"+harness.port+"/rivulets/boom");

  client.on('connect', function() {
    setTimeout(function() {
      harness.rivulet.send("boom", { name: 'brandon' });
    }, 15);
  });

  client.on('data', function(person) {
    t.equals(person.name, 'brandon', 'data event received');
  });

  t.on('end', function() {
    harness.close();
    client.disconnect();
  });
});

tape('emits a data event with string parameter', function(t) {
  t.plan(1);

  var harness = buildHarness();
  var client = new Client("http://localhost:"+harness.port+"/rivulets/boom");

  client.on('connect', function() {
    setTimeout(function() {
      harness.rivulet.send("boom", 'brandon');
    }, 15);
  });

  client.on('data', function(name) {
    t.equals(name, 'brandon', 'data event received');
  });

  t.on('end', function() {
    harness.close();
    client.disconnect();
  });
});

tape('emits a custom event', function(t) {
  t.plan(1);

  var harness = buildHarness();
  var client = new Client("http://localhost:"+harness.port+"/rivulets/boom");

  client.on('connect', function() {
    setTimeout(function() {
      harness.rivulet.send('boom', { name: 'brandon' }, 'private');
    }, 15);
  });

  client.on('private', function(person) {
    t.equals(person.name, 'brandon', 'custom event received');
  });

  t.on('end', function() {
    harness.close();
    client.disconnect();
  });
});

tape('reconnects automatically', function(t) {
  t.plan(2);

  var connections = 0;

  var harness = buildHarness();
  var client = new Client("http://localhost:"+harness.port+"/rivulets/boom");

  client.on('data', function(person) {
    t.equals(person.name, 'ted', 'data event received');
  });

  client.on('connect', function() {
    connections++;
    setTimeout(function() {
      if (connections == 1) {
        harness.close();
        harness = buildHarness(harness.port);
      } else {
        t.ok(true, 'second connect event fired');
        harness.rivulet.send("boom", { name: 'ted' });
      }
    }, 15);
  });

  t.on('end', function() {
    harness.close();
    client.disconnect();
  });
});

