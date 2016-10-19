// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './link', './node-set', './node-multimap', './node-link-multimap'], function(Node, Link, NodeSet, NodeMultimap, NodeLinkMultimap) {
  
  function Web() {
    this.names = new Map();
    this.links = new Set();
    
    this.nodesToLinks = NodeLinkMultimap();
    
    this.fromVia = NodeMultimap();
    this.viaTo   = NodeMultimap();
    this.fromTo  = NodeMultimap();
    
    this._onNames = new Set();
    this._onLinks = new Set();
  }
  
  Web.prototype.getNodes = function() {
    return Promise.resolve(NodeSet(this.nodesToLinks.keys().map(function(nodes) {
      return nodes[0];
    })));
  }
  
  
  // Names
  
  Web.prototype.getNames = function() {
    var names = Array.from(this.names.entries(), function(entry) {
      return {id: Node.fromMapKey(entry[0]), name: entry[1]};
    });
    return Promise.resolve(names);
  }
  
  Web.prototype.addNames = function(names) {
    var self = this;
    names.forEach(function(node) {
      self.names.set(Node.toMapKey(node.id), node.name);
    });
    this._notifyNames(names, []);
    return Promise.resolve();
  }
  
  Web.prototype.removeNames = function(nodes) {
    var self = this;
    nodes.forEach(function(nodeId) {
      self.names.delete(Node.toMapKey(nodeId));
    });
    this._notifyNames([], nodes);
    return Promise.resolve();
  }
  
  Web.prototype.hasName = function(id) {
    return Promise.resolve(this.names.has(Node.toMapKey(id)));
  }
  
  Web.prototype.getName = function(nodeId) {
    var mapKey = Node.toMapKey(nodeId);
    if (!this.names.has(mapKey)) {
      return Promise.resolve("");
    } else {
      return Promise.resolve(this.names.get(mapKey));
    }
  }
  
  Web.prototype.onNames = function(callback) {
    this._onNames.add(callback);
  }
  
  
  // Links
  
  Web.prototype.equal = function(web) {
    var self = this;
    
    return web.getLinks().then(function(links) {
      if (links.length !== self.links.size) {
        return false;
      }
      
      return links.every(function(link) {
        return self.links.has(Node.toHex(link.from) +
                              Node.toHex(link.via) +
                              Node.toHex(link.to));
      });
    });
  }
  
  Web.prototype.setLinks = function(add, remove) {
    var self = this;
    var addedLinks   = [];
    var removedLinks = [];
    add.forEach(function(link) {
      var linkKey = Link.toKey(link);
      if (!self.links.has(linkKey)) {
        self.links.add(linkKey);
        self.nodesToLinks.add([link.from], link);
        self.nodesToLinks.add([link.via],  link);
        self.nodesToLinks.add([link.to],   link);
        self.fromVia.add([link.from, link.via], link.to);
        self.viaTo.add(  [link.via,  link.to],  link.from);
        self.fromTo.add( [link.from, link.to],  link.via);
        addedLinks.push(link);
      }
    });
    remove.forEach(function(link) {
      var linkKey = Link.toKey(link);
      if (self.links.has(linkKey)) {
        self.links.delete(linkKey);
        self.nodesToLinks.delete([link.from], link);
        self.nodesToLinks.delete([link.via],  link);
        self.nodesToLinks.delete([link.to],   link);
        self.fromVia.delete([link.from, link.via], link.to);
        self.viaTo.delete(  [link.via,  link.to],  link.from);
        self.fromTo.delete( [link.from, link.to],  link.via);
        removedLinks.push(link);
      }
    });
    if (addedLinks.length > 0 || removedLinks.length > 0) {
      self._notifyLinks(addedLinks, removedLinks);
    }
    return Promise.resolve();
  }
  
  Web.prototype.hasLink = function(from, via, to) {
    return Promise.resolve(this.links.has(Node.toHex(from) +
                                          Node.toHex(via) +
                                          Node.toHex(to)));
  }
  
  Web.prototype.getLinkCount = function() {
    return this.links.size;
  }
  
  Web.prototype.getNodeCount = function() {
    return this.nodesToLinks.size();
  }
  
  Web.prototype.getLinks = function() {
    var links = Array.from(this.links.values(), function(key) {
      return Link.fromKey(key);
    });
    return Promise.resolve(links);
  }
  
  Web.prototype.getLinksForNode = function(node) {
    return Promise.resolve(this.nodesToLinks.get([node]));
  }
  
  Web.prototype.clear = function() {
    this.links.clear();
    this.fromVia.clear();
    this.viaTo.clear();
    this.fromTo.clear();
    return Promise.resolve();
  }
  
  
  // Events
  
  Web.prototype.onLinks = function(callback) {
    this._onLinks.add(callback);
  }
  
  Web.prototype.removeLinksListener = function(callback) {
    this._onLinks.delete(callback);
  }
  
  
  // Query
  
  Web.prototype.query = function(from, via, to) {
    if (from && via && !to) {
      Promise.resolve(this.fromVia.get([from, via]));
    }
    if (via && to && !from) {
      Promise.resolve(this.viaTo.get([via, to]));
    }
    if (from && to && !via) {
      Promise.resolve(this.fromTo.get([from, to]));
    }
    Promise.reject('Invalid query for web.');
  }
  
  Web.prototype.queryOne = function(from, via, to) {
    return this.query(from, via, to).then(function(result) {
      if (result && result.size() === 1) {
        return result.getOne();
      } else {
        return null;
      }
    });
  }
  
  
  // Private
  
  Web.prototype._notifyNames = function(namesAdded, namesRemoved) {
    var callbacks = new Set(this._onNames);
    callbacks.forEach(function(callback) {
      callback(namesAdded, namesRemoved);
    });
  }
  
  Web.prototype._notifyLinks = function(linksAdded, linksRemoved) {
    var callbacks = Array.from(this._onLinks);
    callbacks.forEach(function(callback) {
      callback(linksAdded, linksRemoved);
    });
  }
  
  return function() {
    return new Web();
  }
});
