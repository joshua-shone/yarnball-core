# yarnball

A simple schema-less graph-based database library and command-line tool.

## Commands

### init

Initialize a Yarnball repository in the given directory.

### status

Get statistics about the repository.

### node

Generates a new node, i.e. a universally unique random 16 bytes.

### name \<name\> [node]

Assign a name to a node

### unname \<node\>

Un-assign a name to a node

### names

List all names

### link \<from\> \<via\> \<to\>

Set a link

### unlink \<from\> \<via\> \<to\>

Un-set a link.

### links

List all links.

### query [from] [via] [to]

Perform a query.

### list

Get or set a list.