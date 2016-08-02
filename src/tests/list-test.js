var List = require('../list');
var Node = require('../node');
var Web  = require('../web');
var test = require('tape');

test('list test', function(t) {
  var web = Web();
  
  var Next  = Node.fromHex('432d5b697f3de3bc90eafc4749733981');
  var Value = Node.fromHex('1a6d63d744be303f4d9d47941dceeb9b');
  
  var list = List(web, Next, Value);
  
  t.equal(list.getKeys().length, 0, 'New empty list getKeys().length should be zero.');
  t.equal(list.get().length, 0, 'New empty list get().length should be zero.');
  
  var unknownItem = Node.fromHex('8179519a617ade7ab51180cac79801cd');
  t.equal(list.value(unknownItem), null, 'New empty list should return null for get()');
  t.equal(list.nextKey(unknownItem), null, 'New empty list should return null for nextKey()');
  t.equal(list.previousKey(unknownItem), null, 'New empty list should return null for previousKey()');
  t.equal(list.lastKey(), null, 'New empty list should return null for lastKey()');
  
  var A = Node.fromHex('ec8ec8916afeecccb4b3535644c02ea2');
  var B = Node.fromHex('da31d76def8e8b165a686b7a64ca9936');
  var C = Node.fromHex('a086285ba2367f76d6a43fe46efc6f78');
  var D = Node.fromHex('da0739a96b94421076b0d1e13193463d');
  
  var base = null;
  t.doesNotThrow(function() { base = list.append([A, B, C]) }, 'append() should not throw.');
  t.notEqual(base, null, 'append() should return a new base.');
  t.equal(list.firstKey(), base, 'firstKey() should return the new base returned by append()');
  t.equal(web.getLinks().length, 5, 'appending 3 items should create five links in the web');
  
  var keys = null;
  t.doesNotThrow(function() { keys = list.getKeys(); }, 'getKeys() should not throw.');
  t.equal(keys.length, 3, 'getKeys().length should equal the number of nodes passed to set()');
  var values = null;
  t.doesNotThrow(function() { values = list.get(); }, 'get() should not throw.');
  t.equal(values.length, 3, 'get() should return an array of length 3 after set([a, b, c])');
  t.ok((Node.equal(values[0], A), Node.equal(values[1], B), Node.equal(values[2], C)), 'Get should return the nodes passed into set(), in the same order.');
  
  t.doesNotThrow(function() { list.deleteKeys(keys[1]); }, 'deleteKeys() should not throw.');
  keys = list.getKeys();
  t.equal(keys.length, 2, 'getKeys().length should be 2 after calling deleteKeys() on the second key in a list of three.');
  values = list.get();
  t.equal(values.length, 2, 'get().length should be 2 after calling deleteKeys() on the second key in a list of three.');
  t.equal(web.getLinks().length, 3, 'list should now define 3 links in the web after removing the second item in a list of three.');
  t.notOk(web.hasLink(keys[1], Value, B), 'Web should no longer have the value-defining link for a removed list item.');
  
  t.doesNotThrow(function() { list.append(B); }, 'append(node) for a previously removed list item should not throw.');
  keys = list.getKeys();
  t.equal(keys.length, 3, 'getKeys().length should be restored after re-adding a previously removed value.');
  values = list.get();
  t.equal(values.length, 3, 'get().length should be restored after re-adding a previously removed value.');
  t.ok((Node.equal(values[0], A), Node.equal(values[1], C), Node.equal(values[2], B)), 'get() should return the correct values after removing an item from the middle of a list and then appending it back.');
  
  t.doesNotThrow(function() { list.clear(); }, 'clear() should not throw.');
  t.equal(web.getLinks().length, 0, 'clear() should remove all the links created by the list');
  
  t.end();
});