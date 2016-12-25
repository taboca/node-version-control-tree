var path = require("path"),
    fs = require("fs")
    url = require("url"),
    traverse = require('./lib-tree-json');
    
function init() {
  console.log('Dumping working tree ' + process.argv[2] + ' as tree.json...')
  var parsedTree = traverse.init(process.argv[2]);
  var outFile = path.join(__dirname, 'tree.json')

  var stream = fs.createWriteStream(outFile);
  stream.once('open', function(fd) {
    stream.write(parsedTree);
    stream.end();
  });

}


init();
