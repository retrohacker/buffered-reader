// Refer to the readme for an up-to-date description of the exported object
module.exports = function BufferReader (bufferLength, populateBuffer) {
  // We are going to be friendly to invalid invocations of our constructor.
  // When someone calls our function without using `new`, we will do it for
  // them. Aren't we nice?
  if (!(this instanceof BufferReader)) {
    return new BufferReader(bufferLength, populateBuffer)
  }

  // Create our buffer of responses
  var buffer = []

  // Create a queue for callbacks waiting on a buffered element
  var cbQueue = []

  // When called, fetch will continue to fill the buffer until it reaches the
  // capacity defined by bufferLength
  function fetch () {
    populateBuffer(function () {
      // If there is a callback waiting for a response, pass this response
      // straight to that callback. Otherwise, add it to the buffer
      if (cbQueue.length > 0) {
        cbQueue.shift().apply(this, arguments)
      } else {
        buffer.push(arguments)
      }

      // If there is still work to do, keep on working
      if (buffer.length < bufferLength) {
        fetch()
      }
    })
  }

  // Go ahead and start filling up the buffer
  fetch()

  // Our constructed object needs to be a function, so we have to do some
  // prototype wizardry to wire up our new object's prototype to a function
  // that we can return.
  var func = function readerInvocation (cb) {
    // If the buffer already has an item in it, great! Lets return it
    if (buffer.length > 0) {
      fetch() // Replace the item we are about to unbuffer
      return cb.apply(null, buffer.shift())
    } else {
      // If the buffer didn't have an object in it, add our callback to the
      // queue of callbacks waiting for a response to be available
      cbQueue.push(cb)
    }
  }

  // Altering __proto__ hurts performance, we will revisit this
  func.__proto__ = this.__proto__ // eslint-disable-line no-proto
  return func
}
