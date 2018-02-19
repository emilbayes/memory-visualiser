var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')

var funs = require('./elements/funcs')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
}

app.use(funs)
app.use(table)

app.route('/', function (state, emit) {
  return html`<body class="bg-near-black white-80 sans-serif">
    <form class="pa1 white-80 fr f7" onsubmit=${update}>
      <section class="measure-narrow">
        <label for="offset" class="f6 b db mb2">Offset</label>
        <input  class="input-reset ba b--white-10 pa1 mb1 db w-100" type="numeric" name="offset" placeholder="offset" aria-describedby="offset-desc" />
        <small id="offset-desc" class="f6 lh-copy white-60 db mb2">
          Integer for offsetting the bytes in memory
        </small>
      </section>
      <section class="measure-narrow">
        <label for="offset" class="f6 b db mb2">Data</label>
        <input class="input-reset ba b--white-10 pa1 mb1 db w-100" type="numeric" name="data" placeholder="data" aria-describedby="data-desc" />
        <small id="data-desc" class="f6 lh-copy white-60 db mb2">
          Data to write in memory
        </small>
      </section>
      <section className="measure-narrow">
        <select name="encoding" class="input-reset ba b--white-10 pa1 mb1 db w-100">
          <option value="utf8">UTF-8</option>
          <option value="ascii">ASCII</option>
          <option value="hex">HEX</option>
          <option value="base64">base64</option>
        </select>

        <button type="submit">Apply</button>
      </section>
    </form>

    ${funs.render(state, emit)}

    <button>Jump to address (i32)</button>

    ${table.render(state)}
  </body>`

  function update (e) {
    e.preventDefault()
    var d = new FormData(this)
    emit('data:update', {
      offset: +d.get('offset') || 0,
      data: Buffer.from(d.get('data'), d.get('encoding'))
    })
    return false
  }
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
      cells.push(html`<td class="white-80 code f5 w1 h1">${state.memory[i + j] == null ? '' : state.memory[i + j].toString(16).padStart(2, '0')}</td>`)
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

if (!module.parent) app.mount('body')
else module.exports = app
