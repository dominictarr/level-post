# level-post

get consistent post hooks for leveldb.

[![travis](https://travis-ci.org/dominictarr/level-post.png?branch=master)
](https://travis-ci.org/dominictarr/level-post)

[![testling](http://ci.testling.com/dominictarr/level-post.png)
](http://ci.testling.com/dominictarr/level-post)

``` js
var level = require('level')

var db = level('/tmp/whatever-db')

post(db, function (op) {
  //this is called after every put, del, or batch
  console.log(op)
})

db.put('foo', 'bar', function (err) {
  //...
})
```

## License

MIT
