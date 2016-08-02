// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './link-set'], function(Node, LinkSet) {
  
  function NodeLinkMultimap() {
    this._map = new Map();
  }
  
  NodeLinkMultimap.prototype.get = function(nodes) {
    return LinkSet(this._map.get(this._keyForNodes(nodes)) || []);
  }
  
  NodeLinkMultimap.prototype.add = function(nodes, value) {
    var nodesKey = this._keyForNodes(nodes);
    var values = this._map.get(nodesKey);
    if (values) {
      values.add(value);
    } else {
      this._map.set(nodesKey, LinkSet([value]));
    }
  }
  
  NodeLinkMultimap.prototype.delete = function(nodes, value) {
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
  
  NodeLinkMultimap.prototype.clear = function() {
    this._map.clear();
  }
  
  NodeLinkMultimap.prototype.size = function() {
    return this._map.size;
  }
  
  NodeLinkMultimap.prototype.keys = function() {
    return Array.from(this._map.keys(), function(nodesKey) {
      var nodes = [];
      for (var i=0; i < nodesKey.length; i+=32) {
        nodes.push(Node.fromHex(nodesKey.slice(i, i + 32)));
      }
      return nodes;
    });
  }
  
  NodeLinkMultimap.prototype._keyForNodes = function(nodes) {
    return nodes.map(function(node) {
      return Node.toHex(node);
    }).join('');
  }
  
  return function() {
    return new NodeLinkMultimap();
  }
});