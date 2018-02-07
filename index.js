var css = require('sheetify')
var choo = require('choo')
var store = require('./stores/clicks')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(store)

app.route('/', require('./views/main'))
app.route('/*', require('./views/404'))
function encodePrintableAscii (byte) {
  // What about space chars? Look at hexdump
  if (byte <= 32) return '·'
  return String.fromCharCode(byte)
}

if (!module.parent) app.mount('body')
else module.exports = app
