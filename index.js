var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')

var funs = require('./elements/funcs')
var mem = require('./elements/mem')
var table = require('./elements/table')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
}

app.use(funs)
app.use(mem)
app.use(table)

// Hack for bankai SSR
app.route('/', render)
app.route('/memory-visualiser', render)

function render (state, emit) {
  return html`<body class="bg-near-black white-80 sans-serif">
    ${mem.render(state, emit)}

    ${funs.render(state, emit)}

    ${table.render(state, emit)}
  </body>`
}

app.use(function init (state, emitter) {
  emitter.emit(funs.EV_SET_MODULE, require('./reverse-wasm')())
})

if (!module.parent) app.mount('body')
else module.exports = app
