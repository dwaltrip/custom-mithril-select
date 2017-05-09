
### Select Component for Mithril apps

This is a custom select that strives to mimic the behavior of native `<select>` elements as closely as possible.

The primary benefit is that it can be entirely controlled by the attributes it receives (e.g. pass `value` to specify which option is currently selected). Doing so prevents the select state from getting out of sync with the app state, especially in more specialized use cases where atypical logic is executed in the `change` event handler.

A side benefit: native `<select>` elements open on the `mousedown` event, which prevents using the `mousedown` for anything else. One example: creating a draggable widget that still drags even if the drag is initiated on a child `<select>` element. This component uses `click` to open the options panel, which would allow one to use `mousedown` for initiating a drag operation.

### Example Usage

```js
import Select from 'custom-mithril-select';

var myComponent = {
  oninit: function() {
    this.options = [
      { value: 'foo', label: 'Foo!' },
      { value: 'baz',           label: 'Baz!' },
      { value: 'final-option',  label: 'The final option...' }
    ];
    this.selectedValue = 'foo';
    this.isSelectedDisabled = false;
    this.toggleSelect ()=> { this.isSelectedDisabled = !this.isSelectedDisabled; };
  };
  view: function() {
    return m('.container', [
      m('button', { onclick: ()=> this.toggleSelect() }, 'Toggle select'),
      m(Select, {
        options: this.options,
        // Optionally take control of the selected value (otherwise, it manages this state internally)
        value: this.selectedValue,
        onchange: (select) => { this.selectedValue = select.value; },
        isDisabled: this.isSelectedDisabled
      })
    ]);
  }
};
{ options=[], value, selectedOption, onchange, isDisabled=false }
```

### API

#### Component `attrs`

```js
  m(Select, {
    // An array of objects with the `value` property
    // Options can have a `label` property, which will be used instead of `value` as the visible text
    options: options,

    // Set or update the currently selected option
    // If no option has a matching `value`, this attribute is ignored
    value: value,

    // Set or update the currently selected option (very similar to `value`)
    // Expects an object with a `value` property
    // If both `value` and `selectedOption` are passed, `value` takes precedence
    selectedOption: selectedOption,

    // A function that will be called when the user selects a new option
    // The first argument of the function will be the component instance
    // It is NOT called when the value is changed via the passed attributes
    onchange: function(select) {},

    // Disable/enable the select (it is enabled by default)
    isDisabled: true || false
  })
```

#### Component instance

| Property | Description |
|---|---|
| `select.value` | Returns the `value` of the selected option |
| `select.container` | Root DOM element for the component |
| `select.isOpen` | Indicates if the options panel is open |
| `select.isDisabld` | Indicates if the select is disabled |


### Missing features

  * Disabling/enabling of individual options
  * Ability to open/close the select by passing an `isOpen` attribute
  * Compatibility with accessibility standards (aria attributes, etc.)
  * Escape hatch with access to DOM element, so users can attach event handlers or execute specialized logic
