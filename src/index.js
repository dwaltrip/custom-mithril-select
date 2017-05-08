import m from 'mithril';

const UP_KEY      = 38;
const DOWN_KEY    = 40;
const ESCAPE_KEY  = 27;
const ENTER_KEY   = 13;

// TODO: handle `onchange` handlers passed in as an `attr`
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
    this.targetOption = this.selectedOption;
    document.addEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },
  close: function() {
    this.isOpen = false;
    this.targetOption = null;
    document.removeEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },
  selectOption: function(option) {
    this.selectedOption = option;
    this.close();
    // TODO: fire off `onchange` event
  },
  // NOTE: This is currently only called on an `ENTER` keydown event
  selectTargetedOption: function() {
    this.selectedOption = this.targetOption;
    this.close();
    // TODO: fire off `onchange` event
  },

  renderOption: function(option) {
    var classes = [
      option.value === this.selectedOption.value  ? 'is-selected' : '',
      option.value === this.targetOption.value    ? 'is-target'   : ''
    ].join(' ');
    console.log('option --', option.value, '-- classes:', classes);
    return m('.option', {
      key: option.value,
      class: classes,
      onclick: event => {
        this.selectOption(option);
        event.stopPropagation();
      }
    }, option.name || option.value);
  },

  openViaArrowKeys: function(event) {
    if (event.keyCode === UP_KEY || event.keyCode === DOWN_KEY) {
      this.open();
    } else {
      event.redraw = false;
    }
  },

  handleKeydownInPanel: function(event, options) {
    console.log('handleKeydownInPanel')
    switch (event.keyCode) {
      case UP_KEY:      this.targetPrevOption(options); break;
      case DOWN_KEY:    this.targetNextOption(options); break;
      case ENTER_KEY:   this.selectTargetedOption();    break;
      case ESCAPE_KEY:  this.close();                   break;
      default:
        event.redraw = false; break;
    }
  },

  targetPrevOption: function(options) {
    var index = options.indexOf(this.targetOption);
    // TODO: what happens if component user changes the passed options unexpectedly?
    if (index < 0) { throw new Error('targetOption not found in passed options'); }
    console.log('targetPrevOption');
    if (index > 0) {
      console.log('targetPrevOption -- inside if');
      this.targetOption = options[index - 1];
    }
  },
  targetNextOption: function(options) {
    var index = options.indexOf(this.targetOption);
    // TODO: what happens if component user changes the passed options unexpectedly?
    if (index < 0) { throw new Error('targetOption not found in passed options'); }
    console.log('targetNextOption');
    if (index + 1 < options.length) {
      console.log('targetNextOption -- inside if');
      this.targetOption = options[index + 1];
    }
  },

  view: function(vnode) {
    var options = vnode.attrs.options;
    var open = ()=> this.open();

    return m('.vdom-select', {
      tabindex: 0,
      class: [this.isOpen ? 'is-open' :  ''],
      onclick: ()=> this.open(),
      onkeydown: (this.isOpen ?
        (event => this.handleKeydownInPanel(event, options)) :
        (event => this.openViaArrowKeys(event))
      )
    }, [
      m('.opener', this.selectedOption.name || this.selectedOption.value),

      this.isOpen && m('.option-selection-panel', options.map(option => this.renderOption(option)))
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
