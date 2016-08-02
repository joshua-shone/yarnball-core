// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './node-set'], function(Node, NodeSet) {
  
  function OrderedSet(web, next, base) {
    if (!next) {
      throw 'Cannot create set, "next" node not given.';
    }
    this._web  = web;
    this._next = next;
    this._base = base;
  }
  
  OrderedSet.prototype.get = function() {
    var nodes = NodeSet();
    
    if (this._base) {
      nodes.add(this._base);
      
      var currentNode = this._base;
      while (true) {
        var nextNode = this.next(currentNode);
        if (!nextNode || nodes.has(nextNode)) {
          break;
        }
        currentNode = nextNode;
        nodes.add(currentNode);
      }
    }
    
    return nodes;
  }
  
  OrderedSet.prototype.next = function(node) {
    return this._web.queryOne(node, this._next, null);
  }
  
  OrderedSet.prototype.previous = function(node) {
    return this._web.queryOne(null, this._next, node);
  }
  
  OrderedSet.prototype.last = function() {
    if (!this._base) {
      return null;
    }
    var currentNode = this._base;
    var nodesAlreadySeen = NodeSet([this._base]);
    while (true) {
      var nextNode = this.next(currentNode);
      if (!nextNode || nodesAlreadySeen.has(nextNode)) {
        return currentNode;
      }
      currentNode = nextNode;
    }
  }
  
  OrderedSet.prototype.append = function(nodes) {
    var self = this;
    nodes = Array.from(nodes);
    if (nodes.length > 0) {
      
      // Check for duplicates
      var nodesSet = NodeSet(nodes);
      if (nodesSet.size() !== nodes.length) {
        throw 'Cannot append nodes to set, the given list of nodes contains duplicates.';
      }
        
      var newLinks = [];
      var previousNode = null;
      if (self._base) {
        var existingNodes = self.get();
        // Check if any nodes already exist in the set
        if (nodes.some(function(node) { return existingNodes.has(node) })) {
          throw 'Cannot append nodes to set, one or more nodes already exist in the set.';
        }
        previousNode = self.last();
      } else {
        self._base = nodes[0];
      }
      nodes.forEach(function(node) {
        if (previousNode) {
          newLinks.push({
            from: previousNode,
            via: self._next,
            to: node,
          });
        }
        previousNode = node;
      });
      if (newLinks.length > 0) {
        self._web.setLinks(newLinks, []);
      }
    }
  }
  
  OrderedSet.prototype.delete = function(nodes) {
    var self = this;
    
    if (!self._base) {
      return;
    }
    
    nodes = NodeSet(nodes);
    
    if (nodes.size() > 0) {
      
      var linksAdded   = [];
      var linksRemoved = [];
    
      var currentNode = self._base;
      var nodesAlreadySeen = NodeSet();
      var previousNode = null;
      var lastNonDeletedNode = null;
      while (currentNode) {
        var deletingCurrentNode = nodes.has(currentNode);
        if (previousNode && deletingCurrentNode) {
          linksRemoved.push({
            from: previousNode,
            via: self._next,
            to: currentNode,
          });
        }
        if (!deletingCurrentNode) {
          if (previousNode && nodes.has(previousNode)) {
            linksRemoved.push({
              from: previousNode,
              via: self._next,
              to: currentNode,
            });
          }
          if (lastNonDeletedNode) {
            linksAdded.push({
              from: lastNonDeletedNode,
              via: self._next,
              to: currentNode,
            });
          } else {
            self._base = currentNode;
          }
          lastNonDeletedNode = currentNode;
        }
        var nextNode = self.next(currentNode);
        nodesAlreadySeen.add(currentNode);
        if (!nextNode || nodesAlreadySeen.has(nextNode)) {
          break;
        }
        previousNode = currentNode;
        currentNode = nextNode;
      }
      if (!lastNonDeletedNode) {
        self._base = null;
      }
      
      if (linksAdded.length > 0 || linksRemoved.length > 0) {
        self._web.setLinks(linksAdded, linksRemoved);
      }
    }
  }

  return function(web, base, next) {
    return new OrderedSet(web, base, next);
  }
});
