var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-json'),
    traverseFileSha = require('../lib-tree-sha1-files');

var traverseTree = {

  run: function (treeItem,l) {
    var shaWhole = '';
    if(treeItem.expands == false) {
       shaWhole = (treeItem.sha1);
    } else {
      if(treeItem.tree) {
        let contentTree = '';
        l++;
        for(k in treeItem.tree) {
            let elect = treeItem.tree[k].shortpath;
            let shaLeaf = traverseTree.run(treeItem.tree[k],l);
            contentTree += elect+'/'+shaLeaf+';'
        }
        shaWhole = traverseTree.getSha(contentTree);
        treeItem.treeContent = contentTree;
        treeItem.sha1 = shaWhole;
      }
    }
    return shaWhole;
  },

  getSha: function (mString) {
  		return crypto.createHash('sha1').update(mString).digest('hex');
  }

}

module.exports = traverseTree;
