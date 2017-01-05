var commit = require('./lib-tree-40-index-commit');

console.log('WARNING: Make sure you rm -rf ./index-commits/* contents only, not the main directory')
console.log('WARNING: Make sure you rm -rf ./index/* contents only, not the main directory')

commit.init().then( function ok() {
  console.log("Initialized the ./index-commits directory (lost all you had)")
});
