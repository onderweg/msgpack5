
var test    = require('tap').test
  , msgpack = require('../')

test('encode/decode 2^16 <-> (2^32 - 1) bytes strings', function(t) {

  var encoder = msgpack()
    , all     = []
    , str

  str = new Buffer(Math.pow(2, 16))
  str.fill('a')
  all.push(str.toString())

  str = new Buffer(Math.pow(2, 16) + 1)
  str.fill('a')
  all.push(str.toString())

  str = new Buffer(Math.pow(2, 20))
  str.fill('a')
  all.push(str.toString())

  all.forEach(function(str) {
    t.test('encoding a string of length ' + str.length, function(t) {
      var buf = encoder.encode(str)
      t.equal(buf.length, 5 + Buffer.byteLength(str), 'must be the proper length')
      t.equal(buf[0], 0xdb, 'must have the proper header');
      t.equal(buf.readUInt32BE(1), Buffer.byteLength(str), 'must include the str length');
      t.equal(buf.toString('utf8', 5, Buffer.byteLength(str) + 5), str, 'must decode correctly');
      t.end()
    })

    t.test('decoding a string of length ' + str.length, function(t) {
      var buf = new Buffer(5 + Buffer.byteLength(str))
      buf[0] = 0xdb
      buf.writeUInt32BE(Buffer.byteLength(str), 1)
      buf.write(str, 5)
      t.equal(encoder.decode(buf), str, 'must decode correctly');
      t.end()
    })

    t.test('mirror test a string of length ' + str.length, function(t) {
      t.equal(encoder.decode(encoder.encode(str)), str, 'must stay the same');
      t.end()
    })
  })

  t.end()
})