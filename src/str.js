// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['./node', './list'], function(Node, List) {
  
  var NextChar     = Node.fromHex('2698bc7f1683a11c2362d331b721440e');
  var CharInString = Node.fromHex('ef5c842322d79627a9be173e44866d72');
  var UtfBase      = Node.fromHex('b4c6c2ee25302e31e15b339d052b5667');
  
  function Str(web, base) {
    this._list = List(web, NextChar, CharInString, base);
  }
  
  Str.prototype.get = function() {
    return this._list.get().map(function(node) {
      return nodeToChar(node);
    }).join('');
  }
  
  Str.prototype.set = function(string) {
    var self = this;
    self._list.clear();
    Array.from(string).forEach(function(char) {
      self._list.append(charToNode(char));
    });
  }
  
  Str.prototype.clear = function() {
    this._list.clear();
  }
  
  Str.prototype.getBase = function() {
    return this._list._base;
  }
  
  var arrayBuffer = new ArrayBuffer(16);
  var view        = new DataView(arrayBuffer);
  
  var charToNode = function(char) {
    view.setUint32(0, String([char]).charCodeAt(0), false);
    var charNode = Node();
    for (var i=0; i<16; i++) {
      charNode[i] = UtfBase[i] ^ view.getUint8(i);
    }
    return charNode;
  }
  
  var nodeToChar = function(node) {
    for (var i=0; i<16; i++) {
      view.setUint8(i, node[i] ^ UtfBase[i], false);
    }
    return String.fromCharCode(view.getUint32(0, false));
  }
  
  return function(web, base) {
    return new Str(web, base);
  }
});