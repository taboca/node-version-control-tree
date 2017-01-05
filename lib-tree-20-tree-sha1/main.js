/*

  This will build use the lib-tree-00-json to build the JSON tree, then
  it will populate the sha1 for all child files..
  then it will populate the sha1 for tree element objects..
    
*/

var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-00-json'),
    traverseFileSha = require('../lib-tree-10-files-sha1');

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
