# A JavaScript Version Control System Implementation  

This project is a NodeJS-based implementation of a very simple version control system, alike to GIT (ie. DAG, functional tree) aimed to maintain a version control data structure for local file system updates (tree and text file presence).

The main objectives of the implementation:

* To process a working-tree directory in order to come up with objects to be stored in a objects storage (filesystem). Such objects storage function will store all files, and trees, each with an unique key that is calculated based in its contents. For files, the sha1 key is calculated based in file contents (not file name). For tree objects, sub-directories, the sha1 is calculated from the string that sums the filenames plus all the sha1 for all its imediate sub-directories and/or files. This means that you can only calculate the sha1 for a subdirectory after you have calculated the sha1 of its children.

* To process commits - which is an object associated with the main tree (working-tree) state, i.e. it links to the sha1 object of the main tree. The commit sha1 is calculated based in the string contents: date, sha1 of a tree. 

## Running and learning

* a) node index-sha1.js – will generate tree.json for the ./working-tree directory, and its files; the tree.json is the result of traversing all the files, and subdirectories within ./working-tree and generating sha1 for directories and files;

* b) ./init.sh (remove db_* indexes)
 
* c) node index-init.js

* d) node index-objects.js – to index all objects, such as subdirectories and files, within the ./index filesystem database; if you remove all contests from the ./index/* then it means it's like a init again, you lost your objects of past while you may not lose the ability to make objects from the current working tree;

* e) node index-commit.js – will make a commit, using the current state of main tree, using current date, parent commit (or null), current commit the sha1 of the ./working-tree root state; 

* f) node index-webview-sha1.js – set browser to localhost:3000 to see a JSON tree of the working-tree, plus also provides reload link that generates tree.json again;

# Node-JS background projects

* [Node-JS tree traversal to JSON](https://github.com/taboca/directory-to-json)
* [A recursive React-based component for displaying a JSON tree of filesystem](https://github.com/taboca/tree-folder-react)

# Background for DAG, git, functional trees

* [Git reusing blob elements](http://stackoverflow.com/questions/25884901/does-git-reuse-blobs) (Stackoverflow)
* [Internal git objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) (git-scm.com)
* [Learning git internals by example](http://teohm.com/blog/learning-git-internals-by-example)
* [What does the git index contains exactly](http://stackoverflow.com/questions/4084921/what-does-the-git-index-contain-exactly) (stackoverflow)
* [Asynchronously processing immutable tree events](http://www.slidequest.com/Taboca/rg78q)
* [The anatomy of a git commit](http://blog.thoughtram.io/git/2014/11/18/the-anatomy-of-a-git-commit.html#hashes-over-hashes)
* [How does git stores files](http://stackoverflow.com/questions/8198105/how-does-git-store-files)
* [Persistent Trees in git, Clojure and CouchDB](http://eclipsesource.com/blogs/2009/12/13/persistent-trees-in-git-clojure-and-couchdb-data-structure-convergence)
