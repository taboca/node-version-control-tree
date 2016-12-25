var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    shell = require('shelljs'),
    traverse = require('./lib-tree-json'),
    http = require("http");

function init() {
  var parsedTree = traverse.init(process.argv[2]);
  console.log(parsedTree);
}

init();
