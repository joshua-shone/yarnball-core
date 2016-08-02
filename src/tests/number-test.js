var Number = require('../number');
var Web    = require('../web');
var test   = require('tape');

test('number test', function(t) {
  var web = Web();
  
  var number = Number(web);
  t.notOk(number.hasValidNumber(), 'New Number without base should not have a valid number.');
  t.throws(function() { number.get(); }, 'get() on new Number without base should throw.');
  
  var pi = 3.14159;
  
  t.doesNotThrow(function() { number.set(pi); }, 'Setting 3.14159 on a new empty Number should not throw.');
  t.ok(number.hasValidNumber(), 'hasValidNumber should return true after set(3.14159)');
  var linkCount = web.getLinkCount();
  t.equal(linkCount, 13, 'Setting a number with 7 digits should result in 13 links being added to the web.');
  t.equal(number.get(), pi, 'get() should return the number passed to set()');
  t.doesNotThrow(function() { number.set(pi); }, 'Setting the same number again on a Number should not throw.');
  t.ok(number.hasValidNumber(), 'hasValidNumber should return true after setting the same number again.');
  t.equal(linkCount, web.getLinkCount(), 'Setting the same number again should result in the same number of links in the web.');
  linkCount = web.getLinkCount();
  t.equal(number.get(), pi, 'calling get() again should return the same number');
  
  var life = 42;
  t.doesNotThrow(function() { number.set(life); }, 'Setting 42 over an existing number should not throw.');
  t.ok(number.hasValidNumber(), 'hasValidNumber should return true after setting 42 over an existing number');
  t.equal(number.get(), life, 'get() should return 42 after set(42)');
  t.equal(web.getLinkCount(), 3, 'Overwriting a 7 digit number with a 2 digit number should result in 3 links in the web.');
  linkCount = web.getLinkCount();
  
  t.doesNotThrow(function() { number.clear(); }, 'Calling clear() on Number should not throw.');
  t.notOk(number.hasValidNumber(), 'hasValidNumber() should return false after clear()');
  t.equal(web.getLinkCount(), 0, 'Web link count should have returned to previous state after number is cleared.');
  
  t.end();
});