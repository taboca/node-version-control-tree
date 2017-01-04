var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('../lib-tree-00-json');

let commitService = {

	headData         : null,
	thisCommit       : null,
  treeSha1         : null,
	commitDateString : "",
  parentCommit     : null,

  commitIndex: function(treeItem) {
  	return new Promise(function (good,bad) {

			// Read parent last commit from the index-commit db
			let commitHeadInformation = path.join(__dirname, '..', 'index-commits', 'head.json')

			fs.readFile(commitHeadInformation, {encoding: 'utf-8'}, function(err,data){
  		    if (!err){
						commitService.headData = JSON.parse(data);
						commitService.treeSha1 = treeItem.sha1;
						commitService.commitDateString = new Date().toDateString();
						let fullCommitString = '/parent=' + commitService.headData.head + '/tree=' +  commitService.treeSha1 + '/date=' +  commitService.commitDateString;
						commitService.parentCommit = commitService.headData.head;
						commitService.thisCommit = commitService.getSha(fullCommitString);

						console.log('Generating commit for ' + fullCommitString + '==>' + commitService.thisCommit);

						if(commitService.thisCommit in commitService.headData.commits) {
							console.log('Commit ' + commitService.thisCommit + ' already exists in ./index-commits database.')
							good();
						} else {
								console.log("Writing commit=" + commitService.thisCommit + ' to the ./index-commits database..')

								commitService.headData.index++;
								commitService.headData.commits.push(commitService.thisCommit);
								commitService.headData.head = commitService.thisCommit;

								let metaFile = path.join(__dirname, '..', 'index-commits', 'head.json')
			          let stream = fs.createWriteStream(metaFile);
			          stream.once('open', function(fd) {
			            //console.log("Writing: " + stringTree )
									console.log(JSON.stringify(commitService.headData));
			            stream.write(JSON.stringify(commitService.headData));
			            stream.end();
									commitService.writeCommitDirectory(good);
			          });

						}

  		    }else{
  		      bad(console.log(err));
  		    }
  		});
  	});
  },
	writeCommitDirectory(promiseCallBack) {

		let indexKeyDirectoryProposal = path.join(__dirname, '..', 'index-commits', commitService.thisCommit);
		if (!fs.existsSync(indexKeyDirectoryProposal)) {
				fs.mkdirSync(indexKeyDirectoryProposal);

				let metaFile = path.join(__dirname, '..', 'index-commits', commitService.thisCommit, 'meta.json');
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

module.exports = commitService;
