// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./web', './node-set', './link-set'], function(Web, NodeSet, LinkSet) {
  
  function Batch(web) {
    this._targetWeb = web;
    this._batchedAdditions = Web();
    this._batchedRemovals  = Web();
  }
  
  Batch.prototype.apply = function() {
    var add    = this._batchedAdditions.getLinks();
    var remove = this._batchedRemovals.getLinks();
    if (add.length > 0 || remove.length > 0) {
      this._targetWeb.setLinks(add, remove);
      this._batchedAdditions.clear();
      this._batchedRemovals.clear();
    }
  }
  
  
  // Links
  
  Batch.prototype.getLinkCount = function() {
    var self = this;
    var linkCount = self._targetWeb.getLinkCount();
    self._batchedAdditions.getLinks().forEach(function(link) {
      if (!self._targetWeb.hasLink(link.from, link.via, link.to)) {
        linkCount++;
      }
    });
    self._batchedRemovals.getLinks().forEach(function(link) {
      if (self._targetWeb.hasLink(link.from, link.via, link.to)) {
        linkCount--;
      }
    });
    return linkCount;
  }
  
  Batch.prototype.getNodeCount = function() {
    var self = this;
    
    // Get all nodes
    var nodes = self._batchedAdditions.getNodes();
    nodes.addSet(self._targetWeb.getNodes());
    
    // Filter out nodes if the batch will remove all links related to the node
    var nodeCount = 0;
    nodes.forEach(function(node) {
      var linksForNode = self._batchedAdditions.getLinksForNode(node);
      linksForNode.addSet(self._targetWeb.getLinksForNode(node));
      var everyLinkRemovedByBatch = linksForNode.every(function(link) {
        return self._batchedRemovals.hasLink(link.from, link.via, link.to);
      });
      if (!everyLinkRemovedByBatch) {
        nodeCount++;
      }
    });
    return nodeCount;
  }
  
  Batch.prototype.setLinks = function(add, remove) {
    var addSet = LinkSet(add);
    if (Array.from(remove).some(function(link) { return addSet.has(link); })) {
      throw 'Cannot set links on batch, one or more links is present in both the given add and remove lists.';
    }
    this._batchedAdditions.setLinks(add, remove);
    this._batchedRemovals.setLinks(remove, add);
  }
  
  
  // Query
  
  Batch.prototype.hasLink = function(from, via, to) {
    return   this._batchedAdditions.hasLink(from, via, to) ||
           (!this._batchedRemovals.hasLink(from, via, to) &&
             this._targetWeb.hasLink(from, via, to));
  }
  
  Batch.prototype.query = function(from, via, to) {
    var result = NodeSet(this._targetWeb.query(from, via, to));
    result.addSet(this._batchedAdditions.query(from, via, to));
    result.deleteSet(this._batchedRemovals.query(from, via, to));
    return result;
  }
  
  Batch.prototype.queryOne = function(from, via, to) {
    var self = this;
    
    if ((from ? 1:0) + (via ? 1:0) + (to ? 1:0) !== 2) {
      throw 'Cannot perform query for one on batch, invalid query given.';
    }
    
    var batchResult = self._batchedAdditions.queryOne(from, via, to);
    if (batchResult) {
      return batchResult;
    }
    
    var targetWebResult = self._targetWeb.query(from, via, to);
    return targetWebResult.find(function(node) {
      return !self._batchedRemovals.hasLink(from ? from : node,
                                            via  ? via  : node,
                                            to   ? to   : node);
    });
  }
  
  
  return function(web) {
    return new Batch(web);
  }
});