var Str = require('../str');
var Web  = require('../web');
var test = require('tape');

test('str test', function(t) {
  var web = Web();
  
  var str = null;
  t.doesNotThrow(function() {
    str = Str(web);
  }, 'Str constructor should not throw.');
  
  var s = str.get();
  t.equal(typeof s, 'string', 'Type returned from get() on empty Str should be "string".');

  t.doesNotThrow(function() {
    str.set('blah blah');
  }, 'Setting initial string should not throw.');
  
  t.equal(str.get(), 'blah blah', 'Result of get() should equal the string given to set().');
  
  str.set('foo');
  t.equal(str.get(), 'foo', 'After calling set() again, result of get() should equal the string given to set().');
  
  t.end();
});