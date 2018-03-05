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

app.route('*', function (state, emit) {
  return html`<body class="bg-near-black white-80 sans-serif">
    ${mem.render(state, emit)}

    ${funs.render(state, emit)}

    <button>Jump to address (i32)</button>

    ${table.render(state, emit)}
  </body>`
})

app.use(function init (state, emitter) {
  emitter.emit(funs.EV_SET_MODULE, require('./reverse-wasm')())
})

if (!module.parent) app.mount('body')
else module.exports = app
