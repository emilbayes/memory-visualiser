var html = require('choo/html')

module.exports = table

var NS = table.NS = 'table'

function table (state, emitter) {
  var s = state[NS] = {}
  s.stride = 32
  s.offset = 0
  s.end = 256
}

table.render = function (state, emit) {
  var s = state[NS]

  var rows = []

  rows.push(html`<thead><th></th>${Array.from(new Array(s.stride), (_, i) => html`<th class="code white-40">${i}</th>`)}<th class="code white-40">ASCII</th></thead>`)
  for (var i = s.offset; i < s.end; i += s.stride) {
    var cells = [html`<th class="code white-40">${i}</th>`]
    for (var j = 0; j < s.stride; j++) {
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
