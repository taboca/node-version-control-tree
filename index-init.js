var commit = require('./lib-tree-40-index-commit');

console.log('WARNING: Make sure you rm -rf ./db_commits_index/* contents only, not the main directory')
console.log('WARNING: Make sure you rm -rf ./index/* contents only, not the main directory')

commit.init().then( function ok() {
  console.log("Initialized the ./db_commits_index directory (lost all you had)")
});
