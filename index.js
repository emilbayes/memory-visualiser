var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')
var reverseWasm = require('./reverse-wasm')()

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
}

app.use(reverse)
app.use(table)

app.route('/', function (state, emit) {
  return html`<body class="bg-near-black white-80">
    <input onchange=${update}/>
    <button onclick=${doit}>Reverse</button>
    <button>Jump to address (i32)</button>
    ${table.render(state)}
  </body>`

  function update () {
    emit('data:update', this.value)
    emit('render')
  }

  function doit () {
    emit('data:execute')
    emit('render')
  }
})

function reverse (state, emitter) {
  state.memory = reverseWasm.memory

  emitter.on('data:update', function (value) {
    var buf = Buffer.from(value)
    console.log(buf)
    state.len = buf.byteLength
    state.memory.set(buf)
  })

  emitter.on('data:execute', function (value) {
    reverseWasm.exports.reverse(0, state.len)
  })
}

function table (state, emitter) {
  state.stride = 32
  state.offset = 0
  state.end = 1024
}

table.render = function (state, emit) {
  var rows = []

  for (var i = state.offset; i < state.end; i += state.stride) {
    var cells = []
    for (var j = 0; j < state.stride; j++) {
      cells.push(html`<td class="white-80 code f5 w1 h1">${state.memory[i + j] == null ? '' : state.memory[i + j].toString(16).padStart(2, '0')}</td>`)
    }

    cells.push(html`<code>${Array.from(state.memory.slice(i, i + j), encodePrintableAscii).join('')}</code>`)
    rows.push(html`<tr>${cells}</tr>`)
  }

  return html`<table>${rows}</table>`
}

function encodePrintableAscii (byte) {
  // What about space chars? Look at hexdump
  if (byte <= 32) return '·'
  return String.fromCharCode(byte)
}

if (!module.parent) app.mount('body')
else module.exports = app
