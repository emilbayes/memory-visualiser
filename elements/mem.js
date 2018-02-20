var html = require('choo/html')
var css = require('sheetify')

module.exports = mem

var NS = mem.NS = 'mem'

mem.EV_SET = 'mem:set'

function mem (state, emitter) {
  emitter.on(mem.EV_SET, function (str, encoding, offset) {
    var buf = Buffer.from(str, encoding)

    state.memory.set(buf, offset)
    emitter.emit('render')
  })
}

mem.render = function (state, emit) {
  return html`<form class="pa1 white-80 fr f7" onsubmit=${onsubmit}>
    <section class="measure-narrow">
      <label for="offset" class="f6 b db mb2">Offset</label>
      <input  class="input-reset ba b--white-10 pa1 mb1 db w-100" type="numeric" name="offset" placeholder="offset" aria-describedby="offset-desc" value=0 />
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
  </form>`

  function onsubmit (e) {
    e.preventDefault()
    var d = new FormData(this)
    emit(mem.EV_SET, d.get('data'), d.get('encoding'), +d.get('offset'))
    return false
  }
}
