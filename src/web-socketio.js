// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./web', './node', './link'], function(Web, Node, Link) {
  
  function Client(socketio) {
    var self = this;
    
    self._socketio = socketio;
    self._web = Web();
    
    self._isSeeded = false;
    self._onSeed = new Set();
    
    socketio.on('seedLinks', function(serializedLinks) {
      var links = Link.deserialize(serializedLinks);
      self._web.setLinks(links, []);
      self._isSeeded = true;
      self._onSeed.forEach(function(callback) {
        callback();
      });
      self._onSeed.clear();
    });
    socketio.emit('requestSeed');
    
    socketio.on('addNames', function(namesArray) {
      var names = namesArray.map(function(node) {
        return {
          id: new Uint8Array(node[0]),
          name: node[1],
        }
      });
      self._web.addNames(names);
    });
    
    socketio.on('removeNames', function(nodesData) {
      var nodes = Node.deserialize(nodesData);
      self._web.removeNames(nodes);
    });
    
    socketio.on('setLinks', function(params) {
      var add    = Link.deserialize(params.add);
      var remove = Link.deserialize(params.remove);
      self._web.setLinks(add, remove);
    });
  }
  
  
  // Names
  
  Client.prototype.addNames = function(names) {
    this._web.addNames(names);
    var namesData = Array.from(names, function(node) {
      return [
        (new Uint8Array(node.id)).buffer,
        node.name,
      ]
    });
    this._socketio.emit('addNames', namesData);
  }
  
  Client.prototype.removeNames = function(nodes) {
    this._web.removeNames(nodes);
    var nodesData = Node.serialize(nodes);
    this._socketio.emit('removeNames', nodesData);
  }
  
  Client.prototype.getNames = function() {
    return this._web.getNames();
  }
  
  Client.prototype.hasName = function(node) {
    return this._web.hasName(node);
  }
  
  Client.prototype.getName = function(node) {
    return this._web.getName(node);
  }
  
  Client.prototype.onNames = function(callback) {
    this._web.onNames(callback);
  }
  
  
  // Links
  
  Client.prototype.setLinks = function(add, remove) {
    this._web.setLinks(add, remove);
    var linksData = {
      add:    Link.serialize(add).buffer,
      remove: Link.serialize(remove).buffer,
    }
    this._socketio.emit('setLinks', linksData);
  }
  
  Client.prototype.equal = function(web) {
    return this._web.equal(web);
  }
  
  Client.prototype.onLinks = function(callback) {
    this._web.onLinks(callback);
  }
  
  Client.prototype.removeLinksListener = function(callback) {
    this._web.removeLinksListener(callback);
  }
  
  Client.prototype.getLinks = function() {
    return this._web.getLinks();
  }
  
  
  // Query
  
  Client.prototype.getLinkCount = function() {
    return this._web.getLinkCount();
  }
  
  Client.prototype.getNodeCount = function() {
    return this._web.getNodeCount();
  }
  
  Client.prototype.hasLink = function(from, via, to) {
    return this._web.hasLink(from, via, to);
  }
  
  Client.prototype.query = function(from, via, to) {
    return this._web.query(from, via, to);
  }
  
  Client.prototype.queryOne = function(from, via, to) {
    return this._web.queryOne(from, via, to);
  }
  
  Client.prototype.isSeeded = function() {
    return this._isSeeded;
  }
  
  Client.prototype.onSeed = function(callback) {
    this._onSeed.add(callback);
  }
  
  
  function Server(connection, web) {
    var self = this;
    
    self._connection = connection;
    self._web        = web;
    
    // Seed client
    connection.on('requestSeed', function() {
      self._web.getLinks().then(function(links) {
        var serializedLinks = Link.serialize(links);
        connection.emit('seedLinks', Buffer(serializedLinks));
      });
      
      self._web.getNames().then(function(names) {
        var dataToSend = Array.from(names, function(node) {
          return [
            Buffer(node.id),
            node.name,
          ]
        });
        connection.emit('addNames', dataToSend);
      });
    });
    
    // Links
    connection.on('setLinks', function(linksData) {
      var add    = Link.deserialize(linksData.add);
      var remove = Link.deserialize(linksData.remove);
      self._web.setLinks(add, remove);
      connection.broadcast.emit('setLinks', linksData);
    });
    
    // Names
    connection.on('addNames', function(namesData) {
      var names = Array.from(namesData, function(node) {
        return {
          id: Buffer(node[0]),
          name: node[1],
        }
      });
      self._web.addNames(names);
      connection.broadcast.emit('addNames', namesData);
    });
    connection.on('removeNames', function(nodesData) {
      var nodes = Node.deserialize(nodesData);
      self._web.removeNames(nodes);
      connection.broadcast.emit('removeNames', nodesData);
    });
  }
  
  
  return {
    Client: function(socketio) {
      return new Client(socketio);
    },
    Server: function(socketio, web) {
      return new Server(socketio, web);
    },
  }
});