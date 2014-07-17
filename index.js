
var sr = require('string-range')
var defined = require('defined')
var beq = require('buffer-equal')

module.exports = function post (db, opts, each) {
  if(!each)
    each = opts, opts = {}

  if('function' === typeof db.post)
    return db.post(opts, each)

  var encode = (opts && opts.keyEncoding && opts.keyEncoding.encode)
    || (db.options && db.options.keyEncoding && db.options.keyEncoding.encode)
    || function (x) { return x }

  var min = defined(opts.min, opts.gt, opts.gte, opts.start)
  var max = defined(opts.max, opts.lt, opts.lte, opts.end)

  var copts = {}
  if (min !== undefined) copts.min = encode(min)
  if (max !== undefined) copts.max = encode(max)
  var checker = sr.checker(copts)
 
  function cmp (key) {
    var ek = encode(key)
    if (opts.gt && beq(ek, copts.min)) return false
    if (opts.lt && beq(ek, copts.max)) return false
    return checker(ek)
  }

  function onPut (key, val) {
    if(cmp(key))
      each({type: 'put', key: key, value: val})
  }

  function onDel (key, val) {
    if(cmp(key))
      each({type: 'del', key: key, value: val})
  }

  function onBatch (ary) {
    ary.forEach(function (op) {
      if(cmp(op.key))
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
