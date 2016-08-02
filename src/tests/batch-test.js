var Batch = require('../batch');
var Node = require('../node');
var Link = require('../link');
var Web  = require('../web');
var test = require('tape');

test('batch test', function(t) {
  var web = Web();
  
  var existingLink = Link(Node(), Node(), Node());
  web.setLinks([existingLink], []);
  
  var batch = Batch(web);
  
  t.equal(batch.getLinkCount(), 1, 'Calling getLinkCount() on a new empty batch should return the number of links in the underlying web.');
  t.ok(batch.hasLink(existingLink.from, existingLink.via, existingLink.to), 'New empty batch hasLink() should return true for an existing link in the web.');
  t.equal(batch.query(existingLink.from, existingLink.via, null).size(), 1, 'Calling query() on a batch should return results from the underlying web.');
  
  // Add link to batch
  var link = Link(Node(), Node(), Node());
  t.doesNotThrow(function() {
    batch.setLinks([link], []);
  }, 'Calling setLinks([link], []) on a batch should not throw.');
  t.equal(web.getLinkCount(), 1, 'Calling setLinks() on a batch should not change the underlying web link count.');
  t.notOk(web.hasLink(link.from, link.via, link.to), 'Calling setLinks() on a batch should not add any links to the underlying web.');
  t.equal(batch.getLinkCount(), 2, 'GetLinkCount() on a batch should return the underlying web link count, plus links added to the batch.');
  t.equal(batch.query(null, link.via, link.to).size(), 1, 'Querying a batch for a link added to the batch should return results.');
  t.ok(Node.equal(batch.queryOne(link.from, null, link.to), link.via), 'Querying one from a batch for a link added to the batch should return the correct result.');
  t.ok(Node.equal(batch.queryOne(existingLink.from, existingLink.via, null), existingLink.to), 'Querying one from a batch for an existing link in the web return the correct result.');
  
  t.throws(function() {
    batch.setLinks([link], [link]);
  }, 'Attempting to both add and remove the same link using setLinks([link], [link]) on a batch should throw an exception.');
  
  batch.setLinks([existingLink], []);
  t.equal(batch.getLinkCount(), 2, 'getLinkCount() on a batch should return the same number of links after adding a link that already exists in the web.');
  
  // Apply batch
  t.doesNotThrow(function() {
    batch.apply();
  }, 'Calling apply() on a batch should not throw.');
  t.equal(web.getLinkCount(), 2, 'Web link count should increase after batch with links added is applied.');
  t.ok(web.hasLink(link.from, link.via, link.to), 'Web should now have any links added in a batch after it is applied.');
  t.equal(web.query(link.from, link.via, null).size(), 1, 'Querying the underlying web for a link that was added by applying a batch should return results.');
  t.ok(Node.equal(batch.queryOne(link.from, null, link.to), link.via), 'Querying one from a batch for a link previously applied by the batch should return the correct result.');
  
  // Remove link from batch
  batch.setLinks([], [link]);
  t.equal(web.getLinkCount(), 2, 'Web link count should not change after link is removed from batch.');
  t.ok(web.hasLink(link.from, link.via, link.to), 'Link removed from batch should not be removed from underlying web.');
  t.notOk(batch.hasLink(link.from, link.via, link.to), 'Calling hasLink() on a batch for a link that has been removed from the batch should return false.');
  t.equal(batch.query(link.from, link.via, null).size(), 0, 'Querying a batch for a link that has been removed from the batch should return no results.');
  t.notOk(batch.queryOne(link.from, null, link.to), 'Querying one from a batch for a link removed by the batch but still present in the underlying web should not return any result.');
  t.equal(web.query(link.from, link.via, null).size(), 1, 'Querying the underlying web for a link that has been removed from an unapplied batch should still return results.');
  t.ok(web.queryOne(link.from, link.via, null), 'Querying one from the underlying web for a link that has been removed from an unapplied batch should still return a result.');
  
  batch.apply();
  t.equal(web.getLinkCount(), 1, 'Web link count should decrease after batch is applied that has a link removed.');
  t.notOk(web.hasLink(link.from, link.via, link.to), 'Web should no longer have link that was removed from batch after the batch is applied.');
  t.notOk(web.queryOne(link.from, link.via, null), 'Querying one from the underlying web for a link that was removed by applying a batch should not return any result.');
  
  t.end();
});