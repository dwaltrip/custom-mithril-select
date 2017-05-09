import m from 'mithril';

const UP_KEY      = 38;
const DOWN_KEY    = 40;
const ESCAPE_KEY  = 27;
const ENTER_KEY   = 13;
const SPACE_KEY   = 32;
const TAB_KEY     = 9;

// TODO: implement disabling/enabling of individual options
export default {
  oninit: function(vnode) {
    this.updateState(vnode.attrs);
    this.isOpen = false;

    this.closePanelWithoutSideEffects = event => {
      // Only if the mousedown is outside the container
      if (this.isOpen && !this.container.contains(event.target)) {
        this.close();
        // prevent the mousedown from affecting any other elements
        blockEvent(event);
        // This will fire immediately, as 'mousedown' is before 'click'
        // Set useCapture=true to catch the event before any other existing click handlers
        // The mousedown/click events should only close the panel, and not affect other elements
        addOneTimeHandler(document, 'click', blockEvent, true);
        m.redraw();
      }
    };
  },
  oncreate: function(vnode) {
    this.container = vnode.dom;
  },
  onbeforeupdate: function(vnode) {
    this.updateState(vnode.attrs);
  },
  onremove: function() {
    document.removeEventListener('mousedown', this.closePanelWithoutSideEffects, true);
  },

  updateState: function({ options=[], value, selectedOption, onchange, isDisabled=false }) {
    var optionWithGivenValue = value ? options.find(option => option.value === value) : null;
    // the attrs `value` and `selectedOption` will overwrite the currently selected option.
    // otherwise, use current internal value, the first option, or undefined (if `options` is empty)
    this.selectedOption = (
      optionWithGivenValue || selectedOption || this.selectedOption || options[0] || undefined
    );
    this.onchange = onchange || null;

    if (this.targetOption) {
      var values = options.map(option => option.value);
      if (values.indexOf(this.targetOption.value) < 0) {
        this.targetOption = null;
      } else {
        this.targetOption = options.find(option => option.value === this.targetOption.value);
      }
    }

    this.isDisabled = !!isDisabled;
    if (this.isDisabled && this.isOpen) { this.close(); }
  },

  get value()     { return this.selectedOption ? this.selectedOption.value : undefined; },
  get isEnabled() { return !this.isDisabled; },

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
    if (!prevSelectedOption || (prevSelectedOption.value !== option.value)) {
      this.callChangeHandlers();
    }
  },
  callChangeHandlers: function() {
    if (this.onchange) {
      this.onchange(this);
    }
  },

  selectOption: function(option) {
    this.setSelectedOption(option);
    this.close();
  },
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
      case UP_KEY     : this.targetPrevOption(options); break;
      case DOWN_KEY   : this.targetNextOption(options); break;
      case ENTER_KEY  :
      case SPACE_KEY  : this.selectTargetedOption();    break;
      case ESCAPE_KEY : this.close();                   break;
      // You can't tab while a <select> is open (well, not in Chrome/Safari. You can in Firefox)
      case TAB_KEY    : blockEvent(event);              break;
      default:
        event.redraw = false; break;
    }
  },

  targetPrevOption: function(options) {
    var index = options.indexOf(this.targetOption);
    if (index < 0) { throw new Error('targetOption not found in passed options'); }
    if (index > 0) {
      this.targetOption = options[index - 1];
    }
  },
  targetNextOption: function(options) {
    var index = options.indexOf(this.targetOption);
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
    }, option.label || option.value);
  },

  view: function({ attrs:{options} }) {
    var classes = [
      this.isOpen     ? 'is-open'     : '',
      this.isDisabled ? 'is-disabled' : ''
    ].join(' ');
    // TODO: the user should be able to add handlers to events on the .vdom-select element
    // Is there any reason to not make all DOM events for `.vdom-select` available for user?
    return m('.vdom-select', {
      class: classes,
      onclick:    this.isEnabled && (()=> this.open()),
      onkeydown:  this.isEnabled && (this.isOpen ?
        (event => this.handleKeydownInPanel(event, options)) :
        (event => this.openViaKeyboard(event))
      ),
      tabindex:   this.isEnabled && 0,
    }, [
      m('.opener', this.selectedOption.label || this.selectedOption.value),
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
