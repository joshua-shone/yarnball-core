// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './node-set'], function(Node, NodeSet) {
  
  function NodeMultimap() {
    this._map = new Map();
  }
  
  NodeMultimap.prototype.get = function(nodes) {
    return this._map.get(this._keyForNodes(nodes)) || NodeSet();
  }
  
  NodeMultimap.prototype.add = function(nodes, value) {
    var nodesKey = this._keyForNodes(nodes);
    var values = this._map.get(nodesKey);
    if (values) {
      values.add(value);
    } else {
      this._map.set(nodesKey, NodeSet([value]));
    }
  }
  
  NodeMultimap.prototype.delete = function(nodes, value) {
    var nodesKey = this._keyForNodes(nodes);
    if (value) {
      var values = this._map.get(nodesKey);
      values.delete(value);
      if (values.size() === 0) {
        this._map.delete(nodesKey);
      }
    } else {
      this._map.delete(nodesKey);
    }
  }
  
  NodeMultimap.prototype.clear = function() {
    this._map.clear();
  }
  
  NodeMultimap.prototype.size = function() {
    return this._map.size;
  }
  
  NodeMultimap.prototype._keyForNodes = function(nodes) {
    return nodes.map(function(node) {
      return Node.toMapKey(node);
    }).join('');
  }
  
  return function() {
    return new NodeMultimap();
  }
});