var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')

var funs = require('./elements/funcs')
var mem = require('./elements/mem')
var table = require('./elements/table')

var loadWasm = require('./load-wasm')

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
  return html`<body class="bg-near-black white-80 sans-serif" ondragenter=${kill} ondragover=${kill} ondrop=${drop}>
    ${mem.render(state, emit)}

    ${funs.render(state, emit)}

    ${table.render(state, emit)}
  </body>`

  function drop (e) {
    e.stopPropagation()
    e.preventDefault()

    try {
      var f = new FileReader()
      f.onloadend = function () {
        emit(funs.EV_SET_MODULE, loadWasm(f.result))
      }
      f.readAsArrayBuffer(e.dataTransfer.items[0].getAsFile())
    } catch (ex) {
      alert(ex)
    }

    return false
  }

  function kill (e) {
    e.stopPropagation()
    e.preventDefault()
    return false
  }
}

if (!module.parent) app.mount('body')
else module.exports = app
