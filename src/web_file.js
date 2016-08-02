// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', 'fs', 'readline'], function(Node, fs, readline) {
  
  function WebFile(options) {
    this._namesPath = options.namesPath;
    this._linksPath = options.linksPath;
  }
  
  WebFile.prototype.getNames = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      
      var fileStream = fs.createReadStream(self._namesPath);
      
      fileStream.on('error', function(error) {
        reject(error);
      });
      
      fileStream.on('open', function() {
        var names = [];
        readline.createInterface({
          input: fileStream,
          output: process.stdout,
          terminal: false
        })
        .on('line', function(line) {
          if (line.length > 32) {
            var hexString = line.slice(0, 32);
            var name = line.slice(33);
            names.push({
              id: Node.fromHex(hexString),
              name: name,
            });
          }
        })
        .on('close', function() {
          resolve(names);
        });
      });
    });
  }
  
  WebFile.prototype.getLinks = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
      
      var fileStream = fs.createReadStream(self._linksPath);
      
      fileStream.on('error', function(error) {
        reject(error);
      });
      
      fileStream.on('open', function() {
        var links = [];
        readline.createInterface({
          input: fileStream,
          output: process.stdout,
          terminal: false
        })
        .on('line', function(line) {
          if (line.length >= 32 + 1 + 32 + 1 + 32) {
            var fromString = line.slice(0, 32);
            var viaString  = line.slice(32 + 1, 32 + 1 + 32);
            var toString   = line.slice(32 + 1 + 32 + 1, 32 + 1 + 32 + 1 + 32);
            links.push({
              from: Node.fromHex(fromString),
              via:  Node.fromHex(viaString),
              to:   Node.fromHex(toString),
            });
          }
        })
        .on('close', function() {
          resolve(links);
        });
      });
    });
  }
  
  return function(options) {
    if (!options.namesPath || !options.linksPath) {
      throw 'Cannot create web file interface, names/links path(s) not given.';
    }
    return new WebFile(options);
  }
  
});
