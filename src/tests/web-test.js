var Node = require('../node');
var Web  = require('../web');
var test = require('tape');

test('web test', function(t) {
  var web = Web();
  
  t.equal(web.getLinks().length, 0, 'New empty web getLinks().length should be zero.');
  t.ok(web.equal(web), 'New empty web should compare equal to itself.');
  
  var link = {
    from: Node(),
    via:  Node(),
    to:   Node(),
  }
  t.notOk(web.hasLink(link.from, link.via, link.to), 'New empty web should not contain any link.');
  t.doesNotThrow(function() { web.setLinks([link], []); }, 'Web setLinks([link], []) should not throw.');
  t.equal(web.getLinks().length, 1, 'Web getLinks().length should be 1 after setLink([link], []).');
  t.ok(web.equal(web), 'Web should still compare equal to itself after adding link.');
  t.ok(web.hasLink(link.from, link.via, link.to), 'Web hasLink(link) should return true after setLink([link], []).');
  
  t.ok(Node.equal(web.queryOne(link.from, link.via, null),    link.to),   'Querying for one node by giving the from and via of an added link should return the to node.');
  t.ok(Node.equal(web.queryOne(null,      link.via, link.to), link.from), 'Querying for one node by giving the via and to nodes of an added link should return the from node.');
  t.ok(Node.equal(web.queryOne(link.from, null,     link.to), link.via),  'Querying for one node by giving the from and to nodes of an added link should return the via node.');
  
  t.equal(web.query(link.from, link.via, null).size(), 1,    'Querying for nodes by giving the from and via of an added link should return a set with a size of 1.');
  t.ok(   web.query(link.from, link.via, null).has(link.to), 'Querying for nodes by giving the from and via of an added link should return a set that contains the to node.');
  
  t.equal(web.query(null, link.via, link.to).size(), 1,      'Querying for nodes by giving the via and to of an added link should return a set with a size of 1.');
  t.ok(   web.query(null, link.via, link.to).has(link.from), 'Querying for nodes by giving the via and to of an added link should return a set that contains the from node.');
  
  t.equal(web.query(link.from, null, link.to).size(), 1,     'Querying for nodes by giving the from and to of an added link should return a set with a size of 1.');
  t.ok(   web.query(link.from, null, link.to).has(link.via), 'Querying for nodes by giving the from and to of an added link should return a set that contains the via node.');
  
  t.equal(web.getLinkCount(), 1, 'Performing queries on a web should not change the value returned by getLinkCount().');
  t.equal(web.getLinks().length, 1, 'Performing queries on a web should not change size of the array returned by getLinks()');
  
  t.doesNotThrow(function() { web.setLinks([], [link]); }, 'Web setLinks([], [link]) should not throw.');
  t.equal(web.getLinks().length, 0, 'Web getLinks().length should be 0 after setLink([], [link]).');
  t.notOk(web.hasLink(link.from, link.via, link.to), 'Web hasLink(link) should return false after setLink([], [link]).');
  
  web.setLinks([link], []);
  web.setLinks([link], []);
  t.equal(web.getLinks().length, 1, 'Adding the same link twice to a web should only increase the link count by one.');
  
  var web1 = Web();
  var web2 = Web();
  var web3 = Web();
  var link2 = {
    from: Node(),
    via:  Node(),
    to:   Node(),
  }
  web1.setLinks([link], []);
  web2.setLinks([link], []);
  web3.setLinks([link2], []);
  t.ok(web1.equal(web2), 'Two webs with the same link should compare equal.');
  t.notOk(web1.equal(web3), 'Two webs with different links should not compare equal.');
  
  t.end();
});