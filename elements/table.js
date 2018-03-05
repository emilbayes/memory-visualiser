var html = require('choo/html')

module.exports = table

var NS = table.NS = 'table'

table.EV_SET_UNIT = 'table:set-unit'

function table (state, emitter) {
  var s = state[NS] = {}

  s.selectedUnit = 'binary'
  s.units = {
    'binary': {
      unit: 'Bits',
      width: 8,
      base: 2,
      stride: 8
    },
    'hex': {
      unit: 'Bytes',
      width: 2,
      base: 16,
      stride: 32
    }
  }

  s.offset = 0
  s.end = 256

  emitter.on(table.EV_SET_UNIT, function (unit) {
    s.selectedUnit = unit

    emitter.emit('render')
  })
}

table.render = function (state, emit) {
  var s = state[NS]

  var u = s.units[s.selectedUnit]

  var rows = []

  var unitSelect = html`<select name="fn" onchange=${onchange} style="border:none; border-bottom: 1px solid gray;" class="input-reset bg-transparent white-80">
    ${Object.keys(s.units).map(u => html`<option ${u === s.selectedUnit ? 'selected' : ''} value=${u}>${s.units[u].unit}</option>`)}
  </select>`

  rows.push(html`<thead><th class="code white-40">${unitSelect}</th>${Array.from(new Array(u.stride), (_, i) => html`<th class="code white-40">${i * u.width}</th>`)}<th class="code white-40">ASCII</th></thead>`)
  for (var i = s.offset; i < s.end; i += u.stride) {
    var cells = [html`<th class="code white-40">${i * u.width}</th>`]
    for (var j = 0; j < u.stride; j++) {
      var val = state.memory[i + j] == null ? '' : state.memory[i + j].toString(u.base).padStart(u.width, '0')
      cells.push(html`<td class="white-${!val ? '80' : '50'} code f5 w1 h1">${val}</td>`)
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

  function onchange (e) {
    e.preventDefault()

    emit(table.EV_SET_UNIT, this.value)
    return false
  }
}
