// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function() {
  
  function EventEmitterMixin(object) {
    object._eventCallbacks = {};
    
    object.on = function(event, callback) {
      if (event in object._eventCallbacks) {
        var callbacks = object._eventCallbacks[event];
        callbacks.push(callback);
      } else {
        object._eventCallbacks[event] = [callback];
      }
    }
    
    object._fireEvent = function(event, param) {
      var callbacks = object._eventCallbacks[event];
      if (callbacks) {
        callbacks.forEach(function(callback) {
          callback(param);
        });
      }
    }
  }
  
  
  // Server
  
  function Server() {
    this._clients = [];
    EventEmitterMixin(this);
  }

  Server.prototype._addClient = function(client) {
    var self = this;
    self._clients.push(client);
    return new ServerConnection(self, client);
  }
  
  function ServerConnection(server, client) {
    var self = this;
    self._server = server;
    self._client = client;
    EventEmitterMixin(self);
    self.broadcast = {
      emit: function(event, param) {
        self._server._clients.forEach(function(client) {
          if (client !== self._client) {
            client._fireEvent(event, param);
          }
        });
      }
    }
  }
  
  ServerConnection.prototype.emit = function(event, param) {
    this._client._fireEvent(event, param);
  }
  
  
  // Client
  
  function Client(server) {
    this._server = server;
    EventEmitterMixin(this);
    this._serverConnection = server._addClient(this);
  }
  
  Client.prototype.connect = function() {
    this._server._fireEvent('connection', this._serverConnection);
  }
  
  Client.prototype.emit = function(event, param) {
    this._serverConnection._fireEvent(event, param);
  }
  
  
  return {
    Server: Server,
    Client: Client,
  }
  
});