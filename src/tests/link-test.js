var Node = require('../node');
var Link = require('../link');
var test = require('tape');

test('link test', function(t) {
  var A = Node();
  var B = Node();
  var C = Node();
  var D = Node();
  var E = Node();
  var F = Node();
  
  var link1 = null;
  var link2 = null;
  var link3 = null;
  
  t.doesNotThrow(function() {
    link1 = Link(A, B, C);
    link2 = Link(D, E, F);
    link3 = Link(B, E, D);
  }, 'Calling link constructor with valid nodes should not throw.');
  
  t.ok(Link.isLink(link1), 'isLink() should return true on newly constructed link.');
  t.ok(Link.equal(link1, link1), 'A link should compare equal to itself.');
  t.notOk(Link.equal(link1, link2), 'Two different links should not compare equal.');
  
  t.notEqual(Link.toKey(link1), Link.toKey(link2), 'Key for two different links should not compare equal.');
  t.equal(Link.toKey(link1), Link.toKey(link1), 'Keys for the same link should compare equal.');
  t.ok(Link.equal(Link.fromKey(Link.toKey(link1)), Link.fromKey(Link.toKey(link1))), 'Link -> key -> link should compare equal.');
  
  var buffer = null;
  t.doesNotThrow(function() {
    buffer = Link.serialize([link1, link2, link3]);
  }, 'Calling serialize() on an array of three links should not throw.');
  var deserializedLinks = null;
  t.doesNotThrow(function() {
    deserializedLinks = Link.deserialize(buffer);
  }, 'Calling deserialize() on output from serialize() should not throw.');
  t.equal(deserializedLinks.length, 3, 'Number of links outputted by deserialize() should match the number given to serialize()');
  t.ok(deserializedLinks.every(function(link) { return Link.isLink(link); }), 'isLink() should return true for all items returned by deserialize()');
  t.ok(Link.equal(deserializedLinks[0], link1) && Link.equal(deserializedLinks[1], link2) && Link.equal(deserializedLinks[2], link3), 'Links outputted from deserialize() should compare equal to the links given in serialize()');
  
  var serializedEmptyList = null;
  t.doesNotThrow(function() {
    serializedEmptyList = Link.serialize([]);
  }, 'Calling serialize() on an empty list should not throw.');
  t.equal(serializedEmptyList.byteLength, 0, 'Byte length of output from serialize([]) should be zero.');
  var deserializedEmptyList = null;
  t.doesNotThrow(function() {
    deserializedEmptyList = Link.deserialize(serializedEmptyList)
  }, 'Calling deserialize() on an empty buffer should not throw.');
  t.equal(deserializedEmptyList.length, 0, 'Output from deserialize() on an empty buffer should return an array of length 0.');
  
  t.end();
});