import m from 'mithril';

import Foo from '../src/index';

var options = [
  { value: 'foo' },
  { value: 'baz' },
  { value: 'this might be super slick' }
]

var App = {
  view: function() {
    return m('.container', [
      m('h1', 'Arghh..'),

      m(Foo, {
        options: options,
        onchange: (select)=> {
          console.log('Foo Select -- onchange -- new value:', select.selectedOption.value)
        }
      }),

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
