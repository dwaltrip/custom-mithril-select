import m from 'mithril';
import Prop from 'mithril/stream';

import Foo from '../src/index';

var options = [
  { value: 'foo' },
  { value: 'baz' },
  { value: 'this might be super slick' }
];

var extraOptions = [
  { value: 'extra extra' },
  { value: 'dan the man' },
  { value: 'theez!!' },
  { value: 'Buh-kawww' },
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
    // onclick: ()=> console.log('wrapper div', wrapperNum, '-- click'),
    // onmousedown: ()=> console.log('wrapper div', wrapperNum, '-- mouseDown'),
    // onmouseup: ()=> console.log('wrapper div', wrapperNum, '-- mouseUp')
  }, content);
}

var App = {
  oninit: function() {
    this.options = options;
    this.selectedValue = Prop(options[0].value);
    this.selectedOption = Prop(options[0]);

    window.app = this;
    /*
    window.setInterval(()=> {
      // this.overwriteSelectedOption();
      this.shuffleOptions();
      m.redraw()
    }, 7000);
    */
  },
  overwriteSelectedOption: function() {
    var shuff = shuffle(this.options);
    this.selectedValue(shuff[0].value);
    this.selectedOption(shuff[0]);
    console.log('==============================================')
    console.log('SHUFFLED array -- new selectedOption:', shuff[0].value)
    console.log('document.activeElement:', reprTag(document.activeElement));
  },
  shuffleOptions: function() {
    var next = extraOptions.pop();
    if (next) {
      console.log('==============================================')
      console.log('adding new:', next.value);
      this.options.push(next);
      this.options = shuffle(this.options.slice());
      console.log('options shuffled:', this.options.map(o => o.value).join(' -- '));
    }
  },

  view: function() {
    // console.log('App.options:', this.options.map(o => o.value).join(' -- '));

    return m('.container', [
      m('h1', 'Arghh..'),

      wrapperDiv(m(Foo, {
        options: this.options,
        value: this.selectedValue(),
        onchange: (select)=> {
          console.log('Foo Select -- onchange -- new value:', select.selectedOption.value)
          this.selectedValue(select.value);
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

function shuffle(original) {
  var array = original.concat();
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
  return array;
}

function reprTag(el) {
  var tag = el.tagName.toLowerCase();
  var classes = el.className.split(' ').join('.');
  return [
    tag,
    el.id   ? `#${el.id}`   : '',
    classes ? `.${classes}` : ''
  ].join('');
}
