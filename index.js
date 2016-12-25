var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('./lib-tree-json');

function init() {
  console.log('Dumping working tree ' + process.argv[2] + ' as tree.json...')
  var stringTree = traverse.init(process.argv[2]);

  var tree = JSON.parse(stringTree);

  var doneTasks = 0;
  traverseTree(tree.root, 0, function callback(tip) {
    // get the waiting pending elements queue
    // this callback remove each item
    // til final..
    if(tip=='ended' || tip == 'completesha') {
      doneTasks++;
      console.log('Callback: ' + tip);
    }

    if(doneTasks == 2) {
        // final end...
        let stringTree = JSON.stringify(tree);
        console.log(outFile);
        var outFile = path.join(__dirname, 'tree.json')
        var stream = fs.createWriteStream(outFile);
        stream.once('open', function(fd) {
          stream.write(stringTree);
          stream.end();
        });
    }

  });


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

var gInitial = null;
var gQueue = new Array();

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

init();
