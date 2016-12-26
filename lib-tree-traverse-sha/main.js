var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-json');

var gInitial = null;
var gQueue = new Array();

var traverseSha = {
  stringTree : null,
  jsonTree   : null,
  doneTasks  : 0,
  init: function () {
    return new Promise(function (success, fail) {
        console.log('Walking through working tree "working-tree" for sha1 building..');
        traverseSha.stringTree = traverse.init('working-tree');
        traverseSha.jsonTree = JSON.parse(traverseSha.stringTree);

        traverseTree(traverseSha.jsonTree.root, 0, function callback(tip) {
          // get the waiting pending elements queue
          // this callback remove each item
          // til final..
          if(tip=='ended' || tip == 'completesha') {
            traverseSha.doneTasks++;
            console.log('Callback: ' + tip);
          }

          if(traverseSha.doneTasks == 2) {
              console.log("Completed tasks..")
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
          }
        });
    });
  }
}

function getFileSha(filePath) {
	return new Promise(function (good,bad) {
		fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
		    if (!err){
					good(getSha(data));
		    }else{
		      bad(console.log(err));
		    }
		});
	});
}

function getSha(mString) {
		return crypto.createHash('sha1').update(mString).digest('hex');
}

function traverseTree(treeItem,l,cb) {

  var spacer = '';
  if(!gInitial) {
    gInitial = treeItem.shortpath;
  }
  for(var k =0; k<l;k++) spacer+='\\_';

  if(treeItem.expands == false) {
    var shaData = 'pending';
    var currFile = path.join(treeItem.fullpath);
    let localTreeItem = treeItem;
    gQueue.push(currFile);
    getFileSha(currFile).then(function (sha1) {
      localTreeItem.sha1 = sha1;
      gQueue.pop();
      console.log('___'+ gQueue.length)
      if(gQueue.length==0) {
        cb('completesha');
      }
    });
  }
  if(treeItem.tree) {
    l++;
    for(k in treeItem.tree) {
        traverseTree(treeItem.tree[k],l, cb);
    }
  }
  console.log(spacer + treeItem.shortpath);
  if(treeItem.shortpath == gInitial) {
    cb('ended');
  }
}

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
