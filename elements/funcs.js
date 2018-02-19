var html = require('choo/html')
var css = require('sheetify')
var array = require('new-array')

css`
  input + input::before {
    content: ",";
  }
`

module.exports = funcs

var NS = funcs.NS = 'funcs'

funcs.EV_EXECUTE = 'execute'
funcs.EV_UPDATE = 'update'

function funcs (state, emitter) {
  var s = state[NS] = {}

  s.module = require('../reverse-wasm')()
  state.memory = s.module.memory
  s.fns = Object.keys(s.module.exports).filter(k => typeof s.module.exports[k] === 'function')

  s.fn = null
  s.arity = 0
  s.inputs = []
  s.output = 'void'

  emitter.on(funcs.EV_UPDATE, update)
  emitter.on(funcs.EV_EXECUTE, execute)

  update(s.fns[0])

  return

  function update (fn) {
    s.fn = fn

    s.arity = s.module.exports[s.fn].length
    s.inputs = s.inputs.concat(array(s.arity, 0)).slice(0, s.arity)

    emitter.emit('render')
  }

  function execute (inputs) {
    var fn = s.module.exports[s.fn]

    console.log(inputs)

    s.inputs = inputs
    s.output = fn.apply(fn, s.inputs)

    if (s.output == null) s.output = 'void'

    emitter.emit('render')
  }
}

funcs.render = function (state, emit) {
  var s = state[NS]

  var inputs = array(s.arity * 2 - 1, ',')

  for (var i = 0; i < inputs.length / 2; i++) {
    inputs[i * 2] = html`<input name="inputs" value=${s.inputs[i]} style="border:none; border-bottom: 1px solid gray;" class="input-reset w3 bg-transparent white-80 tr"/>`
  }

  // Could also show arity in select
  return html`<form onsubmit=${onexecute} class="ma3">
    <code>
      <select name="fn" onchange=${onchange} style="border:none; border-bottom: 1px solid gray;" class="input-reset bg-transparent white-80">
        ${s.fns.map(fn => html`<option value="${fn}">${fn}</option>`)}
      </select>
      (${inputs})
      <output>${s.output}</output>
    </code>
    <button type="submit">run</button>
  </form>`

  function onexecute (e) {
    e.preventDefault()

    var data = new FormData(this)
    var nums = data.getAll("inputs").map(n => n.startsWith('0x') ? parseInt(n) : parseFloat(n))
    // should assert all .isFinite
    emit(funcs.EV_EXECUTE, nums)
    return false
  }
  function onchange (e) {
    e.preventDefault()

    emit(funcs.EV_UPDATE, this.value)
    return false
  }
}
