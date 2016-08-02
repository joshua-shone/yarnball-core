// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function() {
  
  function Set(web, from, via, to) {
    if (((from ? 1:0) + (via ? 1:0) + (to ? 1:0)) !== 2) {
      throw 'Cannot create set, two of from/via/to must be defined.';
    }
    this.web  = web;
    this.from = from ? from : null;
    this.via  = via  ? via  : null;
    this.to   = to   ? to   : null;
  }
  
  Set.prototype.get = function() {
    return this.web.query(this.from, this.via, this.to);
  }
  
  Set.prototype.has = function(node) {
    return this.web.has(
      this.from ? this.from : node,
      this.via  ? this.via  : node,
      this.to   ? this.to   : node
    );
  }
  
  Set.prototype.add = function(nodes) {
    this.web.setLinks(Array.from(nodes).map(function(node) {
      return {
        from: this.from ? this.from : node,
        via:  this.via  ? this.via  : node,
        to:   this.to   ? this.to   : node,
      }
    }), []);
  }
  
  Set.prototype.remove = function(nodes) {
    this.web.setLinks([], Array.from(nodes).map(function(node) {
      return {
        from: this.from ? this.from : node,
        via:  this.via  ? this.via  : node,
        to:   this.to   ? this.to   : node,
      }
    }));
  }
  
  return function(web, from, via, to) {
    return new Set(web, from, via, to);
  }
  
});