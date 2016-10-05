// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './link', 'level'], function(Node, Link, level) {
  
  function WebDb(databasePath) {
    this._db = level(databasePath);
  }
  
  WebDb.prototype.stats = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      self._db.open(function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(self._db.db.getProperty('leveldb.stats'));
        }
      });
    });
  }
  
  WebDb.prototype.merge = function(web) {
    var self = this;
    return Promise.all([web.getNames(), web.getLinks()]).then(function(values) {
      return self.addNames(values[0])
      .then(function() {
        return self.setLinks(values[1], []);
      });
    });
  }
  
  
  // Names
  
  WebDb.prototype.addNames = function(names) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var ops = names.map(function(node) {
        return {
          type: 'put',
          key: 'name:' + Node.toHex(node.id),
          value: node.name,
        }
      });
      self._db.batch(ops, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  
  WebDb.prototype.removeNames = function(nodes) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var ops = nodes.map(function(nodeId) {
        return {
          type: 'del',
          key: 'name:' + Node.toHex(nodeId),
        }
      });
      self._db.batch(ops, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
  
  WebDb.prototype.getNames = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var names = [];
      self._db.createReadStream()
        .on('data', function(data) {
          if (data.key.startsWith('name:')) {
            names.push({
              id: Node.fromHex(data.key.slice('name:'.length)),
              name: data.value,
            });
          }
        })
        .on('error', function(error) {
          reject(error);
        })
        .on('close', function() {
          resolve(names);
        })
        .on('end', function() {
          resolve(names);
        });
    });
  }
  
  
  // Links
  
  WebDb.prototype.setLinks = function(add, remove) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var ops = add.map(function(link) {
        return {
          type: 'put',
          key: 'link:' + Link.toKey(link),
          value: '1',
        }
      }).concat(remove.map(function(link) {
        return {
          type: 'del',
          key: 'link:' + Link.toKey(link),
        }
      }));
      self._db.batch(ops, function(error) {
        if (error) {
          reject(error)
        } else {
          resolve();
        }
      });
    });
  }
  
  WebDb.prototype.getLinks = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var links = [];
      self._db.createReadStream()
        .on('data', function(data) {
          if (data.key.startsWith('link:')) {
            links.push(Link.fromKey(data.key.slice('link:'.length)));
          }
        })
        .on('error', function(error) {
          reject(error);
        })
        .on('close', function() {
          resolve(links);
        })
        .on('end', function() {
          resolve(links);
        });
    });
  }
  
  WebDb.prototype.getNodes = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      var nodes = new Set();
      self._db.createReadStream()
        .on('data', function(data) {
          if (data.key.startsWith('link:')) {
            var link = Link.fromKey(data.key.slice('link:'.length));
            nodes.add(Node.toHex(link.from));
            nodes.add(Node.toHex(link.via));
            nodes.add(Node.toHex(link.to));
          }
        })
        .on('error', function(error) {
          reject(error);
        })
        .on('close', function() {
          resolve(nodes);
        })
        .on('end', function() {
          resolve(nodes);
        });
    });
  }

  WebDb.prototype.query = function(from, via, to) {
    return this.getLinks().then(function(links) {
      return links.filter(function(link) {
        return (!from || Node.equal(link.from, from)) &&
               (!via  || Node.equal(link.via,  via))  &&
               (!to   || Node.equal(link.to,   to));
      });
    });
  }

  WebDb.prototype.queryOne = function(from, via, to) {
    return this.getLinks().then(function(links) {
      for (var i=0; i < links.length; i++) {
        var link = links[i];
        if ((!from || Node.equal(link.from, from)) &&
            (!via  || Node.equal(link.via,  via))  &&
            (!to   || Node.equal(link.to,   to))) {
          if (!from) {
            return link.from;
          } else if (!via) {
            return link.via;
          } else if (!to) {
            return link.to;
          }
        }
      }
      return null;
    });
  }
  
  return function(databasePath) {
    return new WebDb(databasePath);
  }
  
});
