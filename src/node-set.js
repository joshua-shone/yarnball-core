// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node'], function(Node) {
  
  function NodeSet(initialValue) {
    if (initialValue) {
      if (initialValue instanceof NodeSet) {
        this._set = new Set(initialValue._set);
      } else if (Node.isNode(initialValue)) {
        this._set = new Set([Node.toMapKey(initialValue)]);
      } else {
        this._set = new Set(Array.from(initialValue).map(function(node) {
          return Node.toMapKey(node);
        }));
      }
    } else {
      this._set = new Set();
    }
  }
  
  NodeSet.prototype.add = function(node) {
    this._set.add(Node.toMapKey(node));
  }
  
  NodeSet.prototype.addSet = function(set) {
    var self = this;
    set._set.forEach(function(key) {
      self._set.add(key);
    });
  }
  
  NodeSet.prototype.deleteSet = function(set) {
    var self = this;
    set._set.forEach(function(key) {
      self._set.delete(key);
    });
  }
  
  NodeSet.prototype.delete = function(node) {
    this._set.delete(Node.toMapKey(node));
  }
  
  NodeSet.prototype.has = function(node) {
    return this._set.has(Node.toMapKey(node));
  }
  
  NodeSet.prototype.getOne = function() {
    if (this._set.size === 1) {
      return Node.fromMapKey(Array.from(this._set)[0]);
    } else {
      throw 'Cannot get node set as single node, set size is not 1.';
    }
  }
  
  NodeSet.prototype.clear = function() {
    this._set.clear();
  }
  
  NodeSet.prototype.size = function() {
    return this._set.size;
  }
  
  NodeSet.prototype.forEach = function(callback) {
    this._set.forEach(function(key) {
      callback(Node.fromMapKey(key));
    });
  }
  
  NodeSet.prototype.map = function(callback) {
    return Array.from(this._set).map(function(key) {
      return callback(Node.fromMapKey(key));
    });
  }
  
  NodeSet.prototype.find = function(callback) {
    var result = Array.from(this._set).find(function(key) {
      return callback(Node.fromMapKey(key));
    });
    if (result) {
      return Node.fromMapKey(result);
    } else {
      return null;
    }
  }
  
  NodeSet.prototype.filter = function(callback) {
    var filteredNodes = Array.from(this._set).filter(function(key) {
      return callback(Node.fromMapKey(key));
    }).map(function(key) {
      return Node.fromMapKey(key);
    });
    return new NodeSet(filteredNodes);
  }
  
  return function(nodes) {
    return new NodeSet(nodes);
  }
});