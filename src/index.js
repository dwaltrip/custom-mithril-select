import m from 'mithril';

export default {
  oninit: function({ attrs:{selectedOption, options} }) {
    this.selectedOption = selectedOption || options[0];
    this.isOpen = false;
  },

  open:   function() { this.isOpen = true; },
  close:  function() { this.isOpen = false; },

  renderOption: function(option) {
    var isSelected = option.value === this.selectedOption.value;
    return m('.option', {
      class: [isSelected ? 'is-selected' : '']
    }, option.name || option.value);
  },

  view: function(vnode) {
    var options = vnode.attrs.options;
    var classes = '';

    return m('.vdom-select', {
      tabindex: 0,
      class: [this.isOpen ? 'is-open' :  ''],
      onclick: ()=> this.open()
    }, [
      m('.opener', this.selectedOption.name || this.selectedOption.value),

      // this.isOpen && m('.option-selection-panel', options.map(option => this.renderOption(option)))
      m('.option-selection-panel', options.map(option => this.renderOption(option)))
    ]);
  }
};

