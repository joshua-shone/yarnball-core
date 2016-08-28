#!/usr/bin/env node

require('yargs')
  .command('init', 'Initialize a Yarnball repository in the given directory.', {}, function(argv) {
    var fs = require('fs');
    var WebDB = require('./src/web_db.js');
    fs.mkdir('.yarnball', function(error) {
      if (error && error.code !== 'EEXIST') {
        console.error('Could not create .yarnball directory: ' + error);
        return;
      }
      var webDB = WebDB('.yarnball');
    });
  })
  .command('node', 'Generates a new node, i.e. a universally unique random 16 bytes.', {}, function(argv) {
    var Node = require('./src/node.js');
    console.log(Node.toHex(Node()));
  })
  .command(
    'name <name> [node]', 'Assign a name to a node',
    {},
    function(argv) {
      var WebDB = require('./src/web_db.js');
      var webDB = WebDB('.yarnball');
      var Node = require('./src/node.js');
      var node = null;
      if (argv.node) {
        node = Node.fromHex(argv.node);
      } else {
        node = Node();
      }
      webDB.addNames([
        {
          id: node,
          name: argv.name,
        }
      ]).then(function() {
        console.log(Node.toHex(node) + ' ' + argv.name);
      });
    }
  )
  .command(
    'unname <node>', 'Un-assign a name to a node',
    {},
    function(argv) {
      var WebDB = require('./src/web_db.js');
      var webDB = WebDB('.yarnball');
      var Node = require('./src/node.js');
      var node = Node.fromHex(argv.node);
      webDB.removeNames([node]);
    }
  )
  .command('names', 'List all names', {}, function(argv) {
    var Node = require('./src/node.js');
    var WebDB = require('./src/web_db.js');
    var webDB = WebDB('.yarnball');
    webDB.getNames().then(function(names) {
      names.forEach(function(node) {
        console.log(Node.toHex(node.id) + ' ' + node.name);
      });
    });
  })
  .command('link <from> <via> <to>', 'Set a triple', {}, function(argv) {
    var Node = require('./src/node.js');
    var WebDB = require('./src/web_db.js');
    var webDB = WebDB('.yarnball');
    webDB.setLinks(
      [
        {
          from: Node.fromHex(argv.from),
          via:  Node.fromHex(argv.via),
          to:   Node.fromHex(argv.to),
        },
      ],
      []
    );
  })
  .command('unlink <from> <via> <to>', 'Remove a triple', {}, function(argv) {
    var Node = require('./src/node.js');
    var WebDB = require('./src/web_db.js');
    var webDB = WebDB('.yarnball');
    webDB.setLinks(
      [],
      [
        {
          from: Node.fromHex(argv.from),
          via:  Node.fromHex(argv.via),
          to:   Node.fromHex(argv.to),
        },
      ]
    );
  })
  .command('links', 'List all links', {}, function(argv) {
    var Node = require('./src/node.js');
    var WebDB = require('./src/web_db.js');
    var webDB = WebDB('.yarnball');
    webDB.getLinks().then(function(links) {
      links.forEach(function(link) {
        console.log(
          Node.toHex(link.from) + ' ' +
          Node.toHex(link.via)  + ' ' +
          Node.toHex(link.to)
        );
      });
    });
  })
  .command('commit <type> <file> <next> <value>', 'Commit an array', {}, function(argv) {
    
    var fs = require('fs');
    var List = require('./src/list.js');
    var WebDB = require('./src/web_db.js');
    
    if (argv.type !== 'list') {
      console.error('Only list type is supported.');
    }
    
    var Node = require('./src/node.js');
    
    var next  = Node.fromHex(argv.next);
    var value = Node.fromHex(argv.value);
    
    var webDB = WebDB('.yarnball');
    
    fs.readFile(argv.file, 'utf8', function(error, data) {
      if (error) {
        console.error(error);
        return;
      }
      
      var lines = data.split('\n');
      console.log(lines);
      
      var nodes = [];
      
      lines.forEach(function(line) {
        if (line.length >= 32) {
          console.log(line.slice(0, 32));
          nodes.push(Node.fromHex(line.slice(0, 32)));
        }
      });
      
      var list = List(webDB, next, value);
      list.append(nodes);
    });
  })
  .help('help')
  .argv