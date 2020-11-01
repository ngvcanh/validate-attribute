# Validate Attribute

Validate form using rules at attributes of HTML element

## Using

```js
var validate = $va(selector:mixed[, options: object]).listen([options: object]);
```

## Method

### $va(selector: mixed[, options: object]): ValidateAttribute

Initialize to query find the `section` in document. **Section** can be the `form` or the `block` HTML what they are contains element need to validate.

- `selector` can be objects: `HTMLElement`, `HTMLCollection`, `NodeList`, `string`.
- `options` is object contains configurations value to work.

### .listen([options: object]): ValidateAttribute

Listen `submit` event of `selector` element.

### .action([options: object]): number

Does directly validate the specified elements in the section

The return value is one of three values `-1`, `0`, and `1`

- **-1**: Has element invalid.
- **0**: All elements are valid and remove `submit` event.
- **1**: All elements are valid and `submit` form if this method using inside `.listen()` method.

### .on(name: string, callback: Function): ValidateAttribute

Declare the callback function to doing after the task start or completed.

#### BeforeValidate

```js
validate.on('BeforeValidate', function(selector: HTMLElement): void {
  // Doing anything before validate selector section
});
```

#### PerInvalid

```js
validate.on('PerInvalid', function(element: mixed, rule: object): boolean {
  // Element is a HTMLElement
  // rule = { validate: true, code: string, value: mixed, message: string|null, valid: false };
});
```

if this callback function return `false`, the validate task will be break. And validate all elements with another value return.

#### ValidateFailure

```js
validate.on('ValidateFailure', function(selector: HTMLElement, errors: array): void {
  // errors = [ { element: HTMLElement, rule: object }, ... ];
});
```

#### ValidateSuccess

```js
validate.on('ValidateSuccess', function(selectorContainer: object): void {
  /* 
    selectorContainer = { 
      selector: HTMLElement, 
      elements: array = [
        { name: string, elements: NodeList },
        ...
      ] 
    };
  */
});
```

This callback function only working when value of `ajax` option inside `options` object is specified `false`.

#### AjaxSuccess

```js
validate.on('AjaxSuccess', function(selector: HTMLElement, xhr: XMLHttpRequest, response: mixed): void {

});
```

#### AjaxFailure

```js
validate.on('AjaxFailure', function(selector: HTMLElement, xhr: XMLHttpRequest, error: mixed): void {

});
```

### .addEventListener(eventName: string, handleFunction: Function): ValidateAttribute

### .getData(): string

### .ajax(param: object): ValidateAttribute

### .urlEncoded(): string {}

### .json(): object

### .formData(): FormData

### .validator(): object

### .getMethod(): string

### .getEnctype(): string

### .getUrl(): string

### .getValue(): string

### .max([ value: string ]): string | ValidateAttribute

### .min([ value: string ]): string | ValidateAttribute

### .isEmpty([ value: string ]): string | ValidateAttribute

### .getValueAt(): string

### .type([ value: string ]): string | ValidateAttribute

### .name([ value: string ]): string | ValidateAttribute

### .attribute(name: string[, value: string ]) : string | ValidateAttribute

### .element(): HTMLElement | null

### .rulesChecked(): object

### .rulesString(): object

### .ruleMax(): object

### .ruleMin(): object

### .ruleEmpty(): object

## Options

### options.ajax

- Type: boolean
- Default: true
- After validate all elements successfully, this option determines whether to send the data to the server or not.

### options.enctype

- Type: string
- Default: `multipart/form-data`
- Form type will be send to server

### options.method

- Type: string
- Default: `GET`
- Form method will be send to server

### options.prefix

- Type: string
- Default: `va`
- Prefix of attributes on elements will be validate.

### options.removeSubmit

- Type: boolean
- Default: `true`
- Remove submit form by normally way

### options.url

- Type: string
- Default: `null`
- URL will send ajax
