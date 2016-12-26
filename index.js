var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    traverse = require('./lib-tree-json'),
    traverseSha = require('./lib-tree-traverse-sha');

traverseSha.init().then(function success() {
  console.log("Main done..")
});
