
var sr = require('string-range')

module.exports = function post (db, opts, each) {
  if(!each)
    each = opts, opts = {}

  if('function' === typeof db.post)
    return db.post(opts, each)

  var checker = sr.checker(opts)

  function onPut (key, val) {
    if(checker(key))
      each({type: 'put', key: key, value: val})
  }

  function onDel (key, val) {
    if(checker(key))
      each({type: 'del', key: key, value: val})
  }

  function onBatch (ary) {
    ary.forEach(function (op) {
      if(checker(op.key))
        each(op)
    })
  }

  db.on('put', onPut)
  db.on('del', onDel)
  db.on('batch', onBatch)

  return function () {
    db.removeListener('put', onPut)
    db.removeListener('del', onPut)
    db.removeListener('batch', onPut)
  }
}
