var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverseFileSha = require('./lib-tree-sha1-files'),
    traverseTree = require('./lib-tree-sha-tree'),
    traverseIndex = require('./lib-tree-update-index');

traverseFileSha.init().then(function success() {
    console.log("Main done..")
    console.log('Walking through working tree "working-tree" for sha1 tree building...');
    traverseTree.run(traverseFileSha.jsonTree.root, 0);
    traverseIndex.run(traverseFileSha.jsonTree.root, 0, function () {
      console.log("Object indexing ended..")
    });
    //traverseFileSha.dumpFile().then(function ok(){});
    console.log("Dumped tree.json")
});
