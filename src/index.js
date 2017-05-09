import m from 'mithril';

const UP_KEY      = 38;
const DOWN_KEY    = 40;
const ESCAPE_KEY  = 27;
const ENTER_KEY   = 13;
const SPACE_KEY   = 32;
const TAB_KEY     = 9;

export default {
  oninit: function(vnode) {
    this.updateState(vnode.attrs);
    this.isOpen = false;

    this.closePanelWithoutSideEffects = event => {
      // Only if the mousedown is outside the container
      if (this.isOpen && !this.containerElement.contains(event.target)) {
        this.close();
        // prevent the mousedown from affecting any other elements
        blockEvent(event);
        // This will fire immediately, as 'mousedown' is before 'click'
        // Set useCapture=true to catch the event before any other existing click handlers
        // The mousedown/click events should only close the panel, and not affect other elements
        addOneTimeHandler(document, 'click', blockEvent, true);
        m.redraw();
      }
    }
  },
  oncreate: function(vnode) {
    this.containerElement = vnode.dom;
  },
  onupdate: function(vnode) {
    this.updateState(vnode.attrs);
  },
  onremove: function() {
    document.removeEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },

  updateState: function({ selectedOption, options, onchange }) {
    this.selectedOption = selectedOption || this.selectedOption || options[0] || undefined;
    this.externalOnChange = onchange || null;
    var values = options.map(option => option.value);
    if (this.targetOption) {
      if (values.indexOf(this.targetOption.value) < 0) {
        this.targetOption = null;
      } else {
        this.targetOption = options.find(option => option.value === this.targetOption.value);
      }
    }
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
  setSelectedOption: function(option) {
    var prevSelectedOption = this.selectedOption;
    this.selectedOption = option;
    if (prevSelectedOption && (prevSelectedOption.value !== option.value)) {
      this.callChangeHandlers();
    }
  },
  callChangeHandlers: function() {
    if (this.externalOnChange) {
      this.externalOnChange(this);
    }
  },

  selectOption: function(option) {
    this.setSelectedOption(option);
    this.close();
  },
  // NOTE: This is currently only called if keyboard is used to select an option
  selectTargetedOption: function() {
    this.setSelectedOption(this.targetOption);
    this.close();
  },

  openViaKeyboard: function(event) {
    if ([UP_KEY, DOWN_KEY, SPACE_KEY].indexOf(event.keyCode) > -1) {
      this.open();
    } else {
      event.redraw = false;
    }
  },
  handleKeydownInPanel: function(event, options) {
    switch (event.keyCode) {
      case UP_KEY:      this.targetPrevOption(options); break;
      case DOWN_KEY:    this.targetNextOption(options); break;
      case ENTER_KEY:
      case SPACE_KEY:   this.selectTargetedOption();    break;
      case ESCAPE_KEY:  this.close();                   break;
      // You can't tab while a <select> is open
      case TAB_KEY:     blockEvent(event);              break;
      default:
        event.redraw = false; break;
    }
  },

  targetPrevOption: function(options) {
    var index = options.indexOf(this.targetOption);
    // TODO: what happens if component user changes the passed options unexpectedly?
    if (index < 0) { throw new Error('targetOption not found in passed options'); }
    if (index > 0) {
      this.targetOption = options[index - 1];
    }
  },
  targetNextOption: function(options) {
    var index = options.indexOf(this.targetOption);
    // TODO: what happens if component user changes the passed options unexpectedly?
    if (index < 0) { throw new Error('targetOption not found in passed options'); }
    if (index + 1 < options.length) {
      this.targetOption = options[index + 1];
    }
  },

  renderOption: function(option) {
    var isSelected =                      option.value === this.selectedOption.value;
    var isTarget   = this.targetOption && option.value === this.targetOption.value;
    return m('.option', {
      key: option.value,
      class: [
        isSelected ? 'is-selected' : '',
        isTarget   ? 'is-target'   : ''
      ].join(' '),
      // Selecting an <option> in a <select> does not trigger mouse events in parent elements
      onmousedown: blockEvent,
      onmouseup: blockEvent,
      onclick: event => {
        event.stopPropagation();
        this.selectOption(option);
      },
      onmouseenter: ()=> { this.targetOption = option; }
    }, option.name || option.value);
  },

  view: function({ attrs:{options} }) {
    return m('.vdom-select', {
      class: [this.isOpen ? 'is-open' :  ''],
      onclick: ()=> this.open(),
      onkeydown: (this.isOpen ?
        (event => this.handleKeydownInPanel(event, options)) :
        (event => this.openViaKeyboard(event))
      ),
      tabindex: 0
    }, [
      m('.opener', this.selectedOption.name || this.selectedOption.value),
      this.isOpen &&
        m('.option-selection-panel', {
          onmouseleave: ()=> { this.targetOption = null; },
        }, options.map(option => this.renderOption(option)))
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
