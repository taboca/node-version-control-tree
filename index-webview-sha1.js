var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var traverseSha = require('./lib-tree-10-files-sha1');
var traverseTree = require('./lib-tree-20-tree-sha1');
var checkout = require('./lib-tree-50-checkout');

var app = express();

var DIRECTORY_FILE = path.join(__dirname, 'tree.json');
var COMMITS_HISTORY = path.join(__dirname, 'db_commits_index', 'head.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/viewcommit/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.get('/command/tree/reload', function(req, res) {

  traverseSha.init().then(function success() {
      console.log("Main done..")
      console.log('Walking through working tree "working-tree" for sha1 tree building...');
      traverseTree.run(traverseSha.jsonTree.root, 0);
      traverseSha.dumpFile().then(function ok(){
        res.redirect('/')
      });
  });

});

app.get('/api/tree', function(req, res) {
  fs.readFile(DIRECTORY_FILE, function(err, data) {
    if (err) {
      console.error(err);
      //process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/history', function(req, res) {
  fs.readFile(COMMITS_HISTORY, function(err, data) {
    if (err) {
      console.error(err);
      //process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.get('/api/commit/:commitId', function(req, res) {
  fs.readFile(COMMITS_HISTORY, function(err, data) {
    if (err) {
      console.error(err);
      //process.exit(1);
    }
    var commitKey = req.params.commitId;

    checkout.init(commitKey).then(function success(tree) {
      res.json(tree);
    });
  });
});

traverseSha.init().then(function ok1() {
  traverseSha.dumpFile().then(function ok2() {
    app.listen(app.get('port'), function() {
      console.log('Server started: http://localhost:' + app.get('port') + '/');
    });
  });
});
