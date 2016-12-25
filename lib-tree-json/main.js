var path = require("path"),
    fs = require("fs")
    url = require("url"),
    shell = require('shelljs');

var traverse = {

  indexes : {},

  init: function (indexDirectory) {

    //console.log("Will traverse " + indexDirectory);
    this.indexes['root'] = {
      'fullpath': path.join(__dirname,'..',indexDirectory),
      'shortpath': indexDirectory,
      'tree': new Array()
    }

    shell.cd(path.join(__dirname,'..',indexDirectory));
    this.traverseDir(this.indexes['root']);

    return JSON.stringify(this.indexes);

  },

  traverseDir: function (currentNode) {
    //console.log('Current node child len='+currentNode.childs.length);

    if(currentNode.tree.length==0)
     {
      //console.log('Not populated, entering '+currentNode.shortPath)
      var totalDir = 0;
      var i=0;
      shell.ls('-d','*').forEach(function(file) {
        //console.log(shell.pwd());
        //console.log('Listed: ' + file);
        if (shell.test('-d', file)) {
          var currDir = path.join(currentNode.fullpath,file);
          //console.log('Checking dir = ' + file);
          var childNode = {
            'shortpath': file,
            'fullpath': currDir,
            'expands':true,
            'tree': new Array()
          }

          currentNode.tree.push(childNode);

          shell.cd(currDir);
          traverse.traverseDir(childNode);
          shell.cd('..');
        } else {

          var childNode = {
            'shortpath': file,
            'fullpath': currDir,
            'expands':false,
            'tree': null
          }
          currentNode.tree.push(childNode);

        }
      });
    }

  },

  parseIndex: function (fullPath, callBack) {
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(fullPath)
    });
    var bufferFile = '';
    lineReader.on('line', function (line) {
        console.log('Pushing '+ line)
        bufferFile+=line+'\n';
    });
    lineReader.on('close', function (line) {
      callBack(bufferFile);
    });
  }

}

module.exports = traverse;
