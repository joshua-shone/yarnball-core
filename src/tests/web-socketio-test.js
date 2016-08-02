var WebSocketIO = require('../web-socketio');
var TestWeb     = require('./test-web');
var Node        = require('../node');
var MockSocket  = require('./mock-socketio');
var test        = require('tape');

test('web-socketio test', function(t) {
  
  var web = TestWeb();
  
  var socketioServer = new MockSocket.Server();
  var socketioClient = new MockSocket.Client(socketioServer);
  
  var server = null;
  t.doesNotThrow(function() {
    server = WebSocketIO.Server(socketioServer, web);
  }, 'Server constructor should not throw.');
  
  var client = null;
  t.doesNotThrow(function() {
    client = WebSocketIO.Client(socketioClient);
  }, 'Client constructor should not throw.');
  
  t.notOk(client.isSeeded(), 'isSeeded() should return false if the socket has not been connected yet.');
  
  var isSeeded = false;
  function onSeed() {
    isSeeded = true;
  }
  client.onSeed(onSeed);
  
  socketioClient.connect();
  
  t.ok(client.isSeeded(), 'isSeeded() should return true after the socket has been connected.');
  t.ok(isSeeded, 'onSeed() callback should be called after the socket has been connected');
  
  t.equal(client.getLinks().length, web.getLinks().length, 'getLinks().length should return the same number as the web on the server.');
  t.ok(client.equal(web), 'Client should compare equal to web on the server.');
  
  var link = {
    from: Node(),
    via:  Node(),
    to:   Node(),
  }
  client.setLinks([link], []);
  
  t.equal(web.getLinks().length, client.getLinks().length, 'Server web link count should equal the client if a link is added on the client side.');
  t.ok(web.equal(client), 'Server web should compare equal to the client after adding a link on the client side.');
  
  client.setLinks([], [link]);
  t.equal(web.getLinks().length, client.getLinks().length, 'Server web link count should equal the client if a link is removed on the client side.');
  t.ok(web.equal(client), 'Server web should compare equal to the client after removing a link on the client side.');
  
  t.end();
});