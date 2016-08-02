#!/usr/bin/env node

require('yargs')
  .command('create-node', 'Generates a new node, i.e. a universally unique random 16 bytes.', {}, function(argv) {
    var Node = require('./src/node.js');
    console.log(Node.toHex(Node()));
  })
  .help('help')
  .argv