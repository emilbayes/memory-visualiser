var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')

var funs = require('./elements/funcs')
var mem = require('./elements/mem')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
}

app.use(funs)
app.use(mem)
app.use(table)

app.route('/', function (state, emit) {
  return html`<body class="bg-near-black white-80 sans-serif">
    ${mem.render(state, emit)}

    ${funs.render(state, emit)}

    <button>Jump to address (i32)</button>

    ${table.render(state)}
  </body>`
})

function table (state, emitter) {
  state.stride = 32
  state.offset = 0
  state.end = 1024

  emitter.on('data:update', function (d) {
    state.memory.set(d.data, d.offset)

    emitter.emit('render')
  })
}

table.render = function (state, emit) {
  var rows = []

  rows.push(html`<thead><th></th>${Array.from(new Array(state.stride), (_, i) => html`<th class="code white-40">${i}</th>`)}<th class="code white-40">ASCII</th></thead>`)
  for (var i = state.offset; i < state.end; i += state.stride) {
    var cells = [html`<th class="code white-40">${i}</th>`]
    for (var j = 0; j < state.stride; j++) {
      var val = state.memory[i + j] == null ? '' : state.memory[i + j].toString(16).padStart(2, '0')
      cells.push(html`<td class="white-${val !== '00' ? '80' : '50'} code f5 w1 h1">${val}</td>`)
    }

    cells.push(html`<td><code>${Array.from(state.memory.slice(i, i + j), encodePrintableAscii).join('')}</code></td>`)
    rows.push(html`<tr>${cells}</tr>`)
  }

  return html`<table>${rows}</table>`

  function encodePrintableAscii (byte) {
    // What about space chars? Look at hexdump
    if (byte <= 32 || byte > 127) return '·'
    return String.fromCharCode(byte)
  }
}

app.use(function init (state, emitter) {
  emitter.emit(funs.EV_SET_MODULE, require('./reverse-wasm')())
})

if (!module.parent) app.mount('body')
else module.exports = app
