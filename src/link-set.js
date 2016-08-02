// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./link'], function(Link) {
  
  function LinkSet(initialValue) {
    if (initialValue) {
      if (initialValue instanceof LinkSet) {
        this._set = new Set(initialValue._set);
      } else if (Link.isLink(initialValue)) {
        this._set = new Set([Link.toKey(initialValue)]);
      } else {
        this._set = new Set(Array.from(initialValue).map(function(link) {
          return Link.toKey(link);
        }));
      }
    } else {
      this._set = new Set();
    }
  }
  
  LinkSet.prototype.add = function(link) {
    this._set.add(Link.toKey(link));
  }
  
  LinkSet.prototype.addSet = function(set) {
    var self = this;
    set._set.forEach(function(key) {
      self._set.add(key);
    });
  }
  
  LinkSet.prototype.deleteSet = function(set) {
    var self = this;
    set._set.forEach(function(key) {
      self._set.delete(key);
    });
  }
  
  LinkSet.prototype.delete = function(link) {
    this._set.delete(Link.toKey(link));
  }
  
  LinkSet.prototype.has = function(link) {
    return this._set.has(Link.toKey(link));
  }
  
  LinkSet.prototype.getOne = function() {
    if (this._set.size === 1) {
      return Link.fromKey(Array.from(this._set)[0]);
    } else {
      throw 'Cannot get link set as single link, set size is not 1.';
    }
  }
  
  LinkSet.prototype.clear = function() {
    this._set.clear();
  }
  
  LinkSet.prototype.size = function() {
    return this._set.size;
  }
  
  LinkSet.prototype.forEach = function(callback) {
    this._set.forEach(function(key) {
      callback(Link.fromKey(key));
    });
  }
  
  LinkSet.prototype.map = function(callback) {
    return Array.from(this._set).map(function(key) {
      return callback(Link.fromKey(key));
    });
  }
  
  LinkSet.prototype.every = function(callback) {
    return Array.from(this._set).every(function(key) {
      return callback(Link.fromKey(key));
    });
  }
  
  return function(initialValue) {
    return new LinkSet(initialValue);
  }
});