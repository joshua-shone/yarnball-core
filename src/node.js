// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(function() {
  
  function Node(buffer) {
    
    if (buffer) {
      if (!(buffer instanceof Uint8Array)) {
        throw 'Cannot create node ID, the given parameter is not an Uint8Array';
      }
      if (buffer.byteLength != 16) {
        throw 'Cannot create node ID, the given buffer is not 16 bytes.';
      }
    } else {
      buffer = new Uint8Array(16);
    }
    
    if (typeof window === 'object' && window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(buffer);
    } else if (typeof window === 'object' && typeof window.msCrypto === 'object' && typeof window.msCrypto.getRandomValues === 'function') {
      window.msCrypto.getRandomValues(buffer);
    } else {
      var nodeCrypto = require('crypto');
      var bytes = nodeCrypto.randomBytes(16);
      buffer.set(bytes);
    }
    
    return buffer;
  }
  
  Node.isNode = function(object) {
    return object instanceof Uint8Array && object.byteLength === 16;
  }
  
  Node.equal = function(a, b) {
    if (!Node.isNode(a) || !Node.isNode(b)) {
      throw 'Cannot compare node equality, given parameter(s) are not nodes.';
    }
    return Node.toMapKey(a) === Node.toMapKey(b);
  }
  
  Node.toMapKey = function(node) {
    if (!Node.isNode(node)) {
      throw 'Cannot convert node to map key, parameter is not a node.';
    }
    return Array.from(node).toString();
  }
  
  Node.fromMapKey = function(key) {
    return new Uint8Array(JSON.parse('[' + key + ']'));
  }
    
  Node.toHex = function(node) {
    if (!Node.isNode(node)) {
      throw 'Cannot convert node to hex string, parameter is not a node.';
    }
    var hexString = "";
    node.forEach(function(v) {
      var hex = v.toString(16);
      if (hex.length === 1) {
        hex = "0" + hex;
      }
      hexString += hex;
    });
    return hexString;
  }
  
  Node.makeHex = function() {
    var node = Node();
    return Node.toHex(node);
  }
    
  Node.fromHex = function(hexString) {
    if (hexString.length !== 16*2) {
      throw "Can't convert hex string '" + hexString + "' to node id, length is not 32.";
    }
    var array = new Uint8Array(16);
    for (var i=0; i<16; i++) {
      var hex = hexString.slice(i*2, (i*2) + 2);
      var int = parseInt(hex, 16);
      if (isNaN(int)) {
        throw "Can't convert hex string '" + hexString + "' to node id, characters '" + hex + "' could not be converted to an integer.";
      }
      array[i] = int;
    }
    return array;
  }
  
  Node.isHex = function(object) {
    if (typeof object !== 'string') {
      return false;
    }
    
    if (object.length != 16*2) {
      return false;
    }
    
    return /^[0-9A-Fa-f]+$/.test(object);
  }
  
  Node.serialize = function(nodes) {
    nodes = Array.from(nodes);
    if (nodes.some(function(node) { return !Node.isNode(node); })) {
      throw 'Cannot serialize nodes, one or more entries in the given array are not valid nodes.';
    }
    var buffer = new Uint8Array(nodes.length * 16);
    var i=0;
    nodes.forEach(function(node) {
      buffer.set(node, i);
      i += 16;
    });
    return buffer;
  }
  
  Node.deserialize = function(buffer) {
    buffer = new Uint8Array(buffer);
    if (buffer.byteLength % 16 !== 0) {
      throw 'Cannot deserialize nodes, given buffer length is not a multiple of 16.';
    }
    var nodes = [];
    for (var i=0; i < buffer.byteLength; i += 16) {
      nodes.push(buffer.subarray(i, i + 16));
    }
    return nodes;
  }
  
  return Node;
});
