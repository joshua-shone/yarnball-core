// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node'], function(Node) {
  
  function Link(from, via, to) {
    if (!from || !via || !to) {
      throw 'Cannot create link, from/via/to not given.';
    }
    if (!Node.isNode(from) || !Node.isNode(via) || !Node.isNode(to)) {
      throw 'Cannot create link, given from/via/to parameters are not nodes.';
    }
    return {
      from: from,
      via: via,
      to: to,
    }
  }
  
  Link.isLink = function(object) {
    return 'from' in object &&
           'via'  in object &&
           'to'   in object &&
           Node.isNode(object.from) &&
           Node.isNode(object.via) &&
           Node.isNode(object.to);
  }
  
  Link.equal = function(link1, link2) {
    return Node.equal(link1.from, link2.from) &&
           Node.equal(link1.via,  link2.via) &&
           Node.equal(link1.to,   link2.to);
  }
  
  Link.toKey = function(link) {
    if (!link.from || !link.via || !link.to) {
      throw 'Cannot make key for link, from, via or to not specified.';
    }
    return Node.toHex(link.from) +
           Node.toHex(link.via) +
           Node.toHex(link.to);
  }
  
  Link.fromKey = function(key) {
    if (key.length !== 32 + 32 + 32) {
      throw 'Cannot get link from key, key length is incorrect.';
    }
    return {
      from: Node.fromHex(key.slice(0, 32)),
      via:  Node.fromHex(key.slice(32, 32 + 32)),
      to:   Node.fromHex(key.slice(32 + 32, 32 + 32 + 32)),
    }
  }
  
  Link.serialize = function(links) {
    links = Array.from(links);
    var combinedBuffer = new Uint8Array(links.length * 16 * 3);
    var i = 0;
    links.forEach(function(link) {
      combinedBuffer.set(link.from, i);
      combinedBuffer.set(link.via,  i + 16);
      combinedBuffer.set(link.to,   i + 16 + 16);
      i += 16 * 3;
    });
    return combinedBuffer;
  }
  
  Link.deserialize = function(array) {
    array = new Uint8Array(array);
    if (array.byteLength % (16 * 3) !== 0) {
      throw 'Cannot deserialize links from UInt8-array, the given array size is not a multiple of 16 * 3.';
    }
    var links = [];
    for (var i=0; i < array.byteLength; i += 16 * 3) {
      links.push({
        from: array.subarray(i,           i + 16),
        via:  array.subarray(i + 16,      i + 16 + 16),
        to:   array.subarray(i + 16 + 16, i + 16 + 16 + 16),
      });
    }
    return links;
  }
  
  return Link;
});