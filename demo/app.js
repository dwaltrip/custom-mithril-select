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

      m(Foo, { options: options }),

      m('select', { style: {marginTop: '40px'} }, options.map(option => m('option', {
        value: option.value
      }, option.value))),


      m('select', { style: {marginTop: '40px'} }, options.map(option => m('option', {
        value: option.value
      }, option.value)))
    ])
  }
};

m.mount(document.getElementById('root'), App);
