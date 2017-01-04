var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-00-json');

// This will go through the tree, and waiting for asynchronous
// operations which calculate sha1 for all files...
// final JSON tree has sha1 attribute, for files..
var traverseSha = {
  stringTree : null,
  jsonTree   : null,
  doneTasks  : 0,
  init: function () {
    return new Promise(function (success, fail) {
        console.log('Walking through working tree "working-tree" for sha1 building..');
        traverseSha.stringTree = traverse.init('working-tree');
        traverseSha.jsonTree = JSON.parse(traverseSha.stringTree);

        traverseTree.run(traverseSha.jsonTree.root, 0, function callback(tip) {
          // get the waiting pending elements queue
          // this callback remove each item
          // til final..
          if(tip=='ended' || tip == 'completesha') {
            traverseSha.doneTasks++;
            console.log('Callback: ' + tip);
          }

          if(traverseSha.doneTasks == 2) {
              console.log("Completed tasks..")
              success(traverseSha.jsonTree);
          }
        });
    });
  },
  dumpFile: function () {
    return new Promise(function (success, fail) {
        let stringTree = JSON.stringify(traverseSha.jsonTree);
        let outFile = path.join(__dirname, '..', 'tree.json')
        let stream = fs.createWriteStream(outFile);
        stream.once('open', function(fd) {
          //console.log("Writing: " + stringTree )
          stream.write(stringTree);
          stream.end();
          traverseSha.doneTasks = 0;
          success();
        });
    })
  }
}

var traverseTree = {
  gInitial : null,
  gQueue   : new Array(),

  run: function (treeItem,l,cb) {

    let spacer = '';
    if(!traverseTree.gInitial) traverseTree.gInitial = treeItem.shortpath;
    for(let k =0; k<l;k++) spacer+='\\_';

    if(treeItem.expands == false) {
      var shaData = 'pending';
      var currFile = path.join(treeItem.fullpath);
      let localTreeItem = treeItem;
      traverseTree.gQueue.push(currFile);
      traverseTree.getFileSha(currFile).then(function (sha1) {
        localTreeItem.sha1 = sha1;
        traverseTree.gQueue.pop();
        console.log('___'+ traverseTree.gQueue.length)
        if(traverseTree.gQueue.length==0) {
          cb('completesha');
        }
      });
    }
    if(treeItem.tree) {
      l++;
      for(k in treeItem.tree) {
          traverseTree.run(treeItem.tree[k],l, cb);
      }
    }
    console.log(spacer + treeItem.shortpath);
    if(treeItem.shortpath == traverseTree.gInitial) {
      cb('ended');
    }
  },
  getFileSha: function(filePath) {
  	return new Promise(function (good,bad) {
  		fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
  		    if (!err){
  					good(traverseTree.getSha(data));
  		    }else{
  		      bad(console.log(err));
  		    }
  		});
  	});
  },
  getSha: function (mString) {
  		return crypto.createHash('sha1').update(mString).digest('hex');
  }

}

// Not in use..
function traversePrint(treeItem,l) {
  var spacer = '';
  for(var k =1; k<l;k++) spacer+='\\_';
  if(treeItem.expands == false) {
    console.log(spacer + treeItem.shortpath + ' sha1 = ' + treeItem.sha1);
  }
  if(treeItem.tree) {
    l++;
    for(k in treeItem.tree) {
        traversePrint(treeItem.tree[k],l);
    }
  }
}

module.exports = traverseSha;
