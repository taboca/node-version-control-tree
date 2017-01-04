var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverseFileSha = require('./lib-tree-10-files-sha1'),
    traverseTree = require('./lib-tree-20-tree-sha1');

traverseFileSha.init().then(function success() {
    console.log("Main done..")
    console.log('Walking through working tree "working-tree" for sha1 tree building...');
    traverseTree.run(traverseFileSha.jsonTree.root, 0);
    traverseFileSha.dumpFile().then(function ok(){});
    console.log("Dumped tree.json")
});
