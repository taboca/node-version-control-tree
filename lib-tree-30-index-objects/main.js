var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-00-json');

let traverseTree = {
  gInitial : null,
  gQueue   : new Array(),

  run: function (treeItem,l,cb) {

    let spacer = '';
    if(!traverseTree.gInitial) traverseTree.gInitial = treeItem.sha1;
    for(let k =0; k<l;k++) spacer+='\\_';

    let localTreeItem = treeItem;
    traverseTree.gQueue.push(treeItem.sha1);
    traverseTree.writeInIndex(treeItem).then(function () {
        localTreeItem.indexed = true;
        traverseTree.gQueue.pop();
        console.log('___'+ traverseTree.gQueue.length);
        // Notice that is not going to happen a write for all the files, because
        // some of the objects can be reused...
        if(traverseTree.gQueue.length==0) {
          cb(' indexed all');
        }
    });

    if(treeItem.tree) {
      l++;
      for(k in treeItem.tree) {
          traverseTree.run(treeItem.tree[k],l, cb);
      }
    }
  },
  writeInIndex: function(treeItem) {
  	return new Promise(function (good,bad) {

      let currFile = path.join(treeItem.fullpath);
      let indexKeyDirectoryProposal = path.join(__dirname, '..', 'index', treeItem.sha1)

      if (!fs.existsSync(indexKeyDirectoryProposal)) {

          fs.mkdirSync(indexKeyDirectoryProposal);
          let metaJSON = {
            'filename': treeItem.shortpath,
            'type':'blob'
          };
          if(treeItem.expands == false) {
          } else {
            metaJSON.type = 'tree';
            metaJSON.treeContent = treeItem.treeContent;
          }
          let stringTree = JSON.stringify(metaJSON);
          let metaFile = path.join(__dirname, '..', 'index', treeItem.sha1, 'meta.json');
          let stream = fs.createWriteStream(metaFile);
          stream.once('open', function(fd) {
            //console.log("Writing: " + stringTree )
            stream.write(stringTree);
            stream.end();
            if(treeItem.expands == false) {
              let blobIn = treeItem.fullpath;
              let blobFile = path.join(__dirname, '..', 'index', treeItem.sha1, 'blob');
              fs.createReadStream(blobIn).pipe(fs.createWriteStream(blobFile));
            }
            good();
          });
      } else {
        good(); // if no writing need, then fine, we pass..
      }
  	});
  }
}

module.exports = traverseTree;
