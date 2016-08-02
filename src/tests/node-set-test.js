var Node    = require('../node');
var NodeSet = require('../node-set');
var test = require('tape');

test('node-set test', function(t) {
  var set = NodeSet();
  
  t.equal(set.size(), 0, 'New empty node-set size should be zero.');
  
  var node = Node();
  
  t.notOk(set.has(node), 'New empty node-set should not contain any node.');
  t.doesNotThrow(function() { set.add(node); }, 'Adding node to node-set should not throw.');
  t.equal(set.size(), 1, 'Node-set size should be 1 after adding node.');
  t.ok(set.has(node), 'Node-set has() should return true for added node.');
  t.ok(Node.equal(set.find(function(node_) { return Node.equal(node_, node); }), node), 'find() should return the correct node when given a valid search callback.');
  
  t.doesNotThrow(function() { set.delete(node); }, 'Deleting node from node-set should not throw.');
  t.equal(set.size(), 0, 'Node-set size should be 0 after deleting node.');
  t.notOk(set.has(node), 'Node-set has() should return false after removing node.');
  
  set.add(node);
  t.doesNotThrow(function() { set.clear(); }, 'Clearing a node-set should not throw.');
  t.equal(set.size(), 0, 'Node-set size should be zero after clearing.');
  
  set.clear();
  set.add(node);
  t.doesNotThrow(function() { set.getOne(); }, 'Node-set getOne() should not throw when size is 1.');
  t.ok(Node.equal(set.getOne(), node), 'Node-set getOne() should return added node.');
  set.delete(node);
  t.throws(function() { set.getOne(); }, 'Node-set getOne() should throw if size is not 1.');
  
  var nodes = [Node(), Node(), Node()];
  set = NodeSet(nodes);
  t.equal(set.size(), 3, 'Node-set initialized with array of 3 nodes should have a size of 3.');
  t.ok(set.has(nodes[0]) && set.has(nodes[1]) && set.has(nodes[2]), 'Node-set should contain nodes that were given in constructor.');
  
  var forEachResult = [];
  t.doesNotThrow(function() {
    set.forEach(function(node) { forEachResult.push(node); });
  }, 'Node-set forEach() should not throw.');
  t.equal(forEachResult.length, 3, 'Node-set forEach callback should be called once for each node in set.');
  t.ok((Node.equal(forEachResult[0], nodes[0]), Node.equal(forEachResult[1], nodes[1]), Node.equal(forEachResult[2], nodes[2])), 'Node-set forEach should return nodes in initialized order');
  
  var mapResult = [];
  t.doesNotThrow(function() {
    mapResult = set.map(function(node) { return node; });
  }, 'Node-set map() should not throw.');
  t.equal(mapResult.length, 3, 'Node-set map callback should be called once for each node in set.');
  t.ok((Node.equal(mapResult[0], nodes[0]), Node.equal(mapResult[1], nodes[1]), Node.equal(mapResult[2], nodes[2])), 'Node-set map should return nodes in initialized order');
  
  t.end();
});