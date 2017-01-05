var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url");

let checkoutService = {

	commitSha1       : null,
  commitMeta       : null,
  commitTree       : null,
  tree : {},
  current : null,
  promisedCallback  : null,

  qDone : new Array(),

  init: function(commitSha1) {
  	return new Promise(function (good,bad) {

      checkoutService.commitSha1 = commitSha1;

			// Read parent last commit from the index-commit db
			let commitHeadInformation = path.join(__dirname, '..', 'index-commits', 'commits', commitSha1, 'meta.json')

			fs.readFile(commitHeadInformation, {encoding: 'utf-8'}, function(err,data){
  		    if (!err){
						checkoutService.commitMeta = JSON.parse(data);
            checkoutService.commitTree = checkoutService.commitMeta.tree;
            checkoutService.commitSha1 = checkoutService.commitMeta.sha1;

            console.log('Querying commit = ' + checkoutService.commitSha1 + ':');
            console.log(checkoutService.commitMeta);
            checkoutService.promisedCallback = good;
            let element = {
                "fullpath":null,
                "shortpath":"working-tree",
                "sha1": checkoutService.commitTree,
                "tree": null,
                "expands": true
            }
            checkoutService.tree = {"root":element}
            checkoutService.qDone.push(checkoutService.commitTree);

            checkoutService.dig(checkoutService.tree.root, checkoutService.commitTree);
  		    }else{
  		      bad(console.log(err));
  		    }
  		});
  	});
  },
  //{"root":{"fullpath":"/Users/taboca/Desktop/all/98_labs/01_dag_patch_commit_gits/01_dir_tree_commit_GIT/working-tree","shortpath":"working-tree","tree":[{"shortpath":"file.txt","fullpath":"/Users/taboca/Desktop/all/98_labs/01_dag_patch_commit_gits/01_dir_tree_commit_GIT/working-tree/file.txt","expands":false,"sha1":"22596363b3de40b06f981fb85d82312e8c0ed511","tree":null}]}}
  dig: function (element, objectSHA1) {

			// Read parent last commit from the index-commit db
  		let commitHeadInformation = path.join(__dirname, '..', 'index', objectSHA1, 'meta.json')
			fs.readFile(commitHeadInformation, {encoding: 'utf-8'}, function(err,data){
  		    if (!err){
            objectEnvelope = JSON.parse(data);

            console.log("==>" , objectSHA1 ,"==>", objectEnvelope);

            if(objectEnvelope.hasOwnProperty('type')) {

              if(objectEnvelope.type=='tree') {

                element.expands = true;
                element.tree = new Array();

                strList = objectEnvelope.treeContent.split(';');

                for(let i=0;i<strList.length-1;i++) {

                  let currItem = strList[i];
                  let splitItem = currItem.split('/');
                  let elementTreeChild = {
                      "fullpath"  : null,
                      "shortpath" : splitItem[0],
                      "expands"   : false,
                      "sha1"      : splitItem[1],
                      "tree"      : null
                  }
                  console.log("==>" , objectSHA1 ,"pushing ==>", splitItem[1]);

                  element.tree.push(elementTreeChild);
                  checkoutService.qDone.push(splitItem[1]);
                  checkoutService.dig(elementTreeChild,splitItem[1]);
                }

              } else {
                console.log("This is file...")
              }

            }
            checkoutService.qDone.pop();
            if(checkoutService.qDone.length==0) {
                checkoutService.promisedCallback(checkoutService.tree);
            }

  		    } else{
  		      bad(console.log(err));
  		    }
  		});

  },

	assembleTree: function (promiseCallBack) {

    checkoutService.openTree(checkoutService.commitTree);

		let indexKeyDirectoryProposal = path.join(__dirname, '..', 'index-commits', 'commits', commitService.thisCommit);
		if (!fs.existsSync(indexKeyDirectoryProposal)) {
				fs.mkdirSync(indexKeyDirectoryProposal);

				let metaFile = path.join(__dirname, '..', 'index-commits', 'commits', commitService.thisCommit, 'meta.json');
				let stream = fs.createWriteStream(metaFile);
				stream.once('open', function(fd) {
					//console.log("Writing: " + stringTree )
					let commitMetaData = {
						"sha1": commitService.headData.head,
						"parentCommit" : commitService.parentCommit,
						"tree": commitService.treeSha1,
						"date": commitService.commitDateString,
					}
					stream.write(JSON.stringify(commitMetaData));
					stream.end();
					promiseCallBack();
				});

		}

	},
	getSha: function (mString) {
			return crypto.createHash('sha1').update(mString).digest('hex');
	}

}

module.exports = checkoutService;
