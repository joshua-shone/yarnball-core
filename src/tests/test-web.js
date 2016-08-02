// Allow this AMD module to be loaded in Node.js
// See https://www.npmjs.com/package/amdefine
if (typeof define !== 'function') { var define = require('amdefine')(module); }

define(['../node', '../web'], function(Node, Web) {
  
  var A = Node.fromHex('0cefafae0871195e1930c92569662964');
  var B = Node.fromHex('7ecc0fabf8fa5279f63603ab5e21ff64');
  var C = Node.fromHex('249ff8081508fdac0fb6d2b502013ef7');
  var D = Node.fromHex('90c1955e10de80f525c4bb55ea76165e');
  var E = Node.fromHex('ca997a7a75faaeda08e2f212379e5874');
  
  return function() {
    var web = Web();
    
    web.setLinks([
      {
        from: A,
        via:  B,
        to:   C,
      },
      {
        from: B,
        via:  D,
        to:   E,
      },
      {
        from: C,
        via:  D,
        to:   E,
      },
    ], []);
    
    return web;
  }
});