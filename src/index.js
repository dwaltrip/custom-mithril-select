import m from 'mithril';

export default {
  oninit: function({ attrs:{selectedOption, options} }) {
    this.selectedOption = selectedOption || options[0];
    this.isOpen = false;
  },

  open:   function() { this.isOpen = true; },
  close:  function() { this.isOpen = false; },

  renderOption: function(option) {
    return m('.option', option.name || option.value);
  },

  view: function(vnode) {
    var options = vnode.attrs.options;
    var classes = '';

    return m('.vdom-select', {
      tabindex: 0,
      onclick: ()=> this.open()
    }, [
      m('.selected-option', this.selectedOption.name || this.selectedOption.value),

      this.isOpen && m('.option-selection-panel', options.map(option => this.renderOption(option)))
    ]);
  }
};

