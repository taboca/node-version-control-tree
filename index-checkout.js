var path = require("path"),
    fs = require("fs"),
    crypto = require('crypto'),
    url = require("url"),
    checkout = require('./lib-tree-50-checkout');

checkout.init(process.argv[2]).then(function success(tree) {
    console.log(JSON.stringify(tree));
});
