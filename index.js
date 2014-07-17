
var sr = require('string-range')
var defined = require('defined')

module.exports = function post (db, opts, each) {
  if(!each)
    each = opts, opts = {}

  if('function' === typeof db.post)
    return db.post(opts, each)

  var encode = (opts && opts.keyEncoding && opts.keyEncoding.encode)
    || (db.options && db.options.keyEncoding && db.options.keyEncoding.encode)
    || function (x) { return x }

  var min = defined(opts.min, opts.start)
  var max = defined(opts.max, opts.end)
  var copts = {}
  if (min !== undefined) copts.min = encode(min)
  if (max !== undefined) copts.max = encode(max)
  var checker = sr.checker(copts)

  function onPut (key, val) {
    if(checker(encode(key)))
      each({type: 'put', key: key, value: val})
  }

  function onDel (key, val) {
    if(checker(encode(key)))
      each({type: 'del', key: key, value: val})
  }

  function onBatch (ary) {
    ary.forEach(function (op) {
      if(checker(encode(op.key)))
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
