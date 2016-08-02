var Node = require('../node');
var test = require('tape');

test('node test', function(t) {
  var n1 = null;
  var n2 = null;
  
  t.doesNotThrow(function() {
    n1 = Node();
    n2 = Node();
  }, 'Node constructor should not throw.');
  
  t.ok(Node.isNode(n1) && Node.isNode(n2), 'isNode() should return true on newly created nodes.');
  
  t.notOk(Node.equal(n1, n2), 'Two created nodes should not be equal.');
  t.ok(Node.equal(n1, n1), 'Node should compare equal to itself.');
  
  t.notEqual(Node.toMapKey(n1), Node.toMapKey(n2), 'Two created node map keys should not be equal.');
  t.equal(Node.toMapKey(n1), Node.toMapKey(n1), 'Map keys for the same node should compare equal.');
  t.ok(Node.equal(Node.fromMapKey(Node.toMapKey(n1)), Node.fromMapKey(Node.toMapKey(n1))), 'Node -> map key -> node should compare equal.');
  
  t.notEqual(Node.toHex(n1), Node.toHex(n2), 'Hex strings of two nodes should not be equal.');
  t.equal(Node.toHex(n1), Node.toHex(n1), 'Hex strings for the same node should be equal.');
  t.ok(Node.equal(Node.fromHex(Node.toHex(n1)), Node.fromHex(Node.toHex(n1))), 'Node -> hex -> node should compare equal.');
  
  t.notEqual(Node.makeHex(), Node.makeHex(), 'Two calls to makeHex() should return different values.');
  
  var l1 = {
    from: Node(),
    via:  Node(),
    to:   Node(),
  }
  
  var l2 = {
    from: Node(),
    via:  Node(),
    to:   Node(),
  }
  
  var serializedNodes = null;
  t.doesNotThrow(function() {
    serializedNodes = Node.serialize([n1, n2]);
  }, 'Calling serialize() on an array of two nodes should not throw.');
  
  var deserializedNodes = null;
  t.doesNotThrow(function() {
    deserializedNodes = Node.deserialize(serializedNodes);
  }, 'Calling deserialize() on the result of serialize() should not throw.');
  
  t.ok(Node.equal(deserializedNodes[0], n1) && Node.equal(deserializedNodes[1], n2), 'Each item in the result of deserialize() should compare equal to the nodes originally given to serialize()');
  
  t.end();
});