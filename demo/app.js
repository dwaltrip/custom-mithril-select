import m from 'mithril';

import Foo from '../src/index';

var options = [
  { value: 'foo' },
  { value: 'baz' },
  { value: 'fuck fuck fuck' }
]

var App = {
  view: function() {
    return m('.container', [
      m('h1', 'Arghh..'),
      m(Foo, { options: options })
    ])
  }
};

m.mount(document.getElementById('root'), App);
