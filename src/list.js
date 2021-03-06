// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './node-set'], function(Node, NodeSet) {
  
  function List(web, next, value, base) {
    if (!next) {
      throw 'Cannot create list, next node not specified.';
    }
    if (!value) {
      throw 'Cannot create list, value node not specified.';
    }
    
    this._web   = web;
    this._next  = next;
    this._value = value;
    this._base  = base || null;
  }
  
  List.prototype.getKeys = function() {
    var self = this;
    
    return new Promise(function(resolve, reject) {
      
      if (!self._base) {
        return [];
      }
    
      var keys = [self._base];
      
      var keysAlreadySeen = NodeSet([self._base]);
    
      var currentKey = self._base;
      
      function getNextKey() {
        self.nextKey(currentKey).then(function(nextKey) {
          if (!nextKey || keysAlreadySeen.has(nextKey)) {
            resolve(keys);
            return;
          }
          currentKey = nextKey;
          keysAlreadySeen.add(currentKey);
          keys.push(currentKey);
          getNextKey();
        });
      }
      
      getNextKey();
    });
  }
  
  List.prototype.get = function() {
    var self = this;
    return this.getKeys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return self.value(key);
      }));
    });
  }
  
  List.prototype.value = function(key) {
    return this._web.queryOne(key, this._value, null);
  }
  
  List.prototype.nextKey = function(key) {
    return this._web.queryOne(key, this._next, null);
  }
  
  List.prototype.previousKey = function(key) {
    return this._web.queryOne(null, this._next, key);
  }
  
  List.prototype.firstKey = function() {
    return this._base;
  }
  
  List.prototype.lastKey = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!self._base) {
        resolve(null);
      }
      var currentNode = self._base;
      var keysAlreadySeen = NodeSet([self._base]);
      function getNextNode() {
        self.nextKey(currentNode).then(function(nextNode) {
          if (!nextNode || keysAlreadySeen.has(nextNode)) {
            resolve(currentNode);
            return;
          }
          currentNode = nextNode;
          getNextNode();
        });
      }
      getNextNode();
    });
  }
  
  List.prototype.append = function(values) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (Node.isNode(values)) {
        values = [values];
      } else {
        values = Array.from(values);
      }
      if (values.length > 0) {
        var newLinks = [];
        self.lastKey().then(function(previousKey) {
          values.forEach(function(value) {
            var key = Node();
            if (!self._base) {
              self._base = key;
            }
            newLinks.push({
              from: key,
              via: self._value,
              to: value,
            });
            if (previousKey) {
              newLinks.push({
                from: previousKey,
                via: self._next,
                to: key,
              });
            }
            previousKey = key;
          });
          if (newLinks.length > 0) {
            return self._web.setLinks(newLinks, []);
          }
        });
      }
      resolve(self._base);
    });
  }
  
  List.prototype.deleteKeys = function(keys) {
    var self = this;
    
    if (!self._base) {
      return;
    }
    
    keys = NodeSet(keys);
    
    if (keys.size() > 0) {
      
      var linksAdded   = [];
      var linksRemoved = [];
    
      var currentKey = self._base;
      var keysAlreadySeen = NodeSet();
      var previousKey = null;
      var lastNonDeletedKey = null;
      while (currentKey) {
        var deletingCurrentNode = keys.has(currentKey);
        if (deletingCurrentNode) {
          linksRemoved.push({
            from: currentKey,
            via: self._value,
            to: this.value(currentKey),
          });
        }
        if (previousKey && deletingCurrentNode) {
          linksRemoved.push({
            from: previousKey,
            via: self._next,
            to: currentKey,
          });
        }
        if (!deletingCurrentNode) {
          if (previousKey && keys.has(previousKey)) {
            linksRemoved.push({
              from: previousKey,
              via: self._next,
              to: currentKey,
            });
          }
          if (lastNonDeletedKey) {
            linksAdded.push({
              from: lastNonDeletedKey,
              via: self._next,
              to: currentKey,
            });
          } else {
            self._base = currentKey;
          }
          lastNonDeletedKey = currentKey;
        }
        var nextKey = self.nextKey(currentKey);
        keysAlreadySeen.add(currentKey);
        if (!nextKey || keysAlreadySeen.has(nextKey)) {
          break;
        }
        previousKey = currentKey;
        currentKey = nextKey;
      }
      if (!lastNonDeletedKey) {
        self._base = null;
      }
      
      if (linksAdded.length > 0 || linksRemoved.length > 0) {
        self._web.setLinks(linksAdded, linksRemoved);
      }
    }
  }
  
  List.prototype.clear = function() {
    var self = this;
    var linksRemoved = [];
    return self.getKeys().then(function(keys) {
      var previousKey = null;
      keys.forEach(function(key) {
        var value = self.value(key);
        if (value) {
          linksRemoved.push({
            from: key,
            via: self._value,
            to: value,
          });
        }
        if (previousKey) {
          linksRemoved.push({
            from: previousKey,
            via: self._next,
            to: key,
          });
        }
        previousKey = key;
      });
      self._base = null;
      if (linksRemoved.length > 0) {
        return self._web.setLinks([], linksRemoved);
      }
    });
  }
  
  return function(web, next, value, base) {
    return new List(web, next, value, base);
  }
});