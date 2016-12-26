var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-json'),
    traverseFileSha = require('../lib-tree-sha1-files');

// This will go through the tree, and waiting for asynchronous
// operations which calculate sha1 for all files...
// final JSON tree has sha1 attribute, for files..
var completeShaTree = {
  stringTree : null,
  jsonTree   : null,
  doneTasks  : 0,
  init: function () {
      traverseFileSha.init().then(function success() {
          console.log("Main done..")
          console.log('Walking through working tree "working-tree" for sha1 tree building...');
          traverseTree.run(traverseFileSha.jsonTree.root, 0);
      });
  }
}

var traverseTree = {
  gInitial : null,
  gQueue   : new Array(),

  run: function (treeItem,l,cb) {
    var shaWhole = '';
    if(treeItem.expands == false) {
       shaWhole = (treeItem.sha1);
    } else {
      if(treeItem.tree) {
        let contentTree = '';
        l++;
        for(k in treeItem.tree) {
            let elect = treeItem.tree[k].shortpath;
            let shaLeaf = traverseTree.run(treeItem.tree[k],l, cb);
            contentTree += elect+'/'+shaLeaf+';'
        }
        shaWhole = traverseTree.getSha(contentTree);
        treeItem.sha1 = shaWhole;
      }
    }
    return shaWhole;
  },

  getSha: function (mString) {
  		return crypto.createHash('sha1').update(mString).digest('hex');
  }

}

module.exports = completeShaTree;
