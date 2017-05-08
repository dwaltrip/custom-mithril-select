import m from 'mithril';

export default {
  oninit: function({ attrs:{selectedOption, options} }) {
    this.selectedOption = selectedOption || options[0];
    this.isOpen = false;

    this.closePanelWithoutSideEffects = event => {
      // Only if the mousedown is outside the container
      console.log('closePanelWithoutSideEffects')
      if (this.isOpen && !this.containerElement.contains(event.target)) {
        console.log('closePanelWithoutSideEffects -- inside if')
        this.close();
        // prevent the mousedown from affecting any other elements
        blockEvent(event);
        // This will fire immediately, as 'mousedown' is before 'click'
        addOneTimeHandler(document, 'click', blockEvent, true);
        // Set useCapture=true to catch the event before any other existing click handlers
        // The mousedown/click events should only close the panel, and not affect other elements
        m.redraw();
      }
    }
  },
  oncreate: function(vnode) {
    this.containerElement = vnode.dom;
  },
  onRemove: function() {
    document.removeEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },

  open: function() {
    this.isOpen = true;
    document.addEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },
  close: function() {
    this.isOpen = false;
  },

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

function addOneTimeHandler(target, eventName, handler, useCapture=false) {
  function oneTimeHandler(event)  {
    handler(event);
    target.removeEventListener(eventName, oneTimeHandler, useCapture);
  };
  target.addEventListener(eventName, oneTimeHandler, useCapture);
}

function blockEvent(event) {
  event.stopImmediatePropagation();
  event.preventDefault();
}
