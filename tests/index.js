var test = require('tape')
var BufferReader = require('../index.js')

test('BufferReader constructor constructs', function (t) {
  var reader = new BufferReader(10, function noop () {})
  t.ok(reader instanceof BufferReader, 'new creates an object')
  reader = BufferReader(10, function noop () {})
  t.ok(reader instanceof BufferReader, 'regular invocation creates object')

  t.end()
})

test('BufferReader depth controls invocation count', function (t) {
  t.plan(12)
  var i = 0
  var reader = new BufferReader(10, function (cb) {
    t.pass('Invoked ' + (++i) + ' times')
    cb()
  })

  // Invoke 2 more times to ensure we continue to fill the buffer
  reader(function noop () {})
  reader(function noop () {})
})

test('BufferReader passes through args', function (t) {
  var reader = new BufferReader(1, function (cb) {
    cb('foo', 'bar', 'buzz', 'bazz')
  })

  reader(function (arg1, arg2, arg3, arg4) {
    t.equal(arg1, 'foo')
    t.equal(arg2, 'bar')
    t.equal(arg3, 'buzz')
    t.equal(arg4, 'bazz')
    t.end()
  })
})

test('BufferReader queues up callbacks', function (t) {
  t.plan(2)

  var i = 0
  var reader = new BufferReader(1, function (cb) {
    i++
    setImmediate(cb)
  })

  reader(function () {
    t.pass('reader was called')
  })

  reader(function () {
    t.pass('reader was called')
  })
})
