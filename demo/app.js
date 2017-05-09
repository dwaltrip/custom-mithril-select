import m from 'mithril';

import Foo from '../src/index';

var options = [
  { value: 'foo' },
  { value: 'baz' },
  { value: 'this might be super slick' }
];

var wrapperDivCache = {}
var count = 0;
function wrapperDiv(content) {
  var key = JSON.stringify(content);
  if (!(key in wrapperDivCache)) {
    wrapperDivCache[key] = ++count;
  }
  var wrapperNum = wrapperDivCache[key];
  return m('.wrapper-div', {
    style: {border: '1px solid #ccc', padding: '15px', backgroundColor: '#aec'},
    onclick: ()=> console.log('wrapper div', wrapperNum, '-- click'),
    onmousedown: ()=> console.log('wrapper div', wrapperNum, '-- mouseDown'),
    onmouseup: ()=> console.log('wrapper div', wrapperNum, '-- mouseUp')
  }, content);
}

var App = {
  view: function() {
    return m('.container', [
      m('h1', 'Arghh..'),

      wrapperDiv(m(Foo, {
        options: options,
        onchange: (select)=> {
          console.log('Foo Select -- onchange -- new value:', select.selectedOption.value)
        }
      })),

      wrapperDiv(m('select', {
        style: {marginTop: '40px'},
        onchange: ()=> console.log('<select> 1 -- onchange')
      }, options.map(option => m('option', {
        value: option.value
      }, option.value)))),

      m('select', {
        style: {marginTop: '40px'},
        onchange: ()=> console.log('<select> 2 -- onchange'),
      }, options.map(option => m('option', {
        value: option.value
      }, option.value)))
    ])
  }
};

m.mount(document.getElementById('root'), App);
