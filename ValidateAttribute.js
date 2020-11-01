function ValidateAttribute(selector, options){
  this.options = {
    ajax: true,
    enctype: 'multipart/form-data',
    method: null,
    prefix: 'va',
    removeSubmit: true,
    url: null
  };

  Object.assign(this.options, options);
  this.selector = selector;

  if (selector){
    if (selector instanceof HTMLElement){
      this.querySelector = [ selector ];
    }
    else if (selector instanceof HTMLCollection || selector instanceof NodeList){
      this.querySelector = selector;
    }
    else if (typeof selector === 'string'){
      this.querySelector = document.querySelectorAll(selector);
    }
  }
  
  this.actionSelector = {
    selector: null,
    elements: null
  };

  this.dataSelector = [];
  
  this.onBeforeValidate = null;
  this.onValidateFailure = null;
  this.onPerInvalid = null;
  this.onValidateSuccess = null;
  this.onBeforeSend = null;
  this.onAjaxSuccess = null;
  this.onAjaxFailure = null;

  this.types = {
    STRING: 'string',
    NUMBER: 'number',
    INTEGER: 'integer',
    CHECKED: 'checked'
  };

  this.attrs = {
    TYPE: 'type',
    NAME: 'name',
    ACTION: 'action',
    ENCTYPE: 'enctype',
    METHOD: 'method',
    EMPTY: 'empty',
    EMPTYMSG: 'empty-msg',
    MIN: 'min',
    MINMSG: 'min-msg',
    MAX: 'max',
    MAXMSG: 'max-msg',
    VALUEAT: 'value-at',
  };

  this.values = {
    HTML: 'html',
    TEXT: 'text',
    VALUE: 'value'
  };

  this.codes = {
    [ this.types.STRING ]: {
      EMPTY: 'VA_STR_EMPTY',
      MIN: 'VA_STR_MIN',
      MAX: 'VA_STR_MAX'
    },
    [ this.types.CHECKED ]: {
      MIN: 'VA_CHECKED_MIN',
      MAX: 'VA_CHECKED_MAX'
    }
  };
  
  return this;
}

ValidateAttribute.fn = ValidateAttribute.prototype;

ValidateAttribute.fn.ruleEmpty = function(){
  var type = this.type();
  var vEmpty = this.isEmpty();
  var value = vEmpty !== 'false';
  var valid = vEmpty === null || value;

  if (type === this.types.STRING){
    valid = valid || !!this.getValue().length
  }

  return { 
    value, valid, validate: vEmpty !== null, code: this.codes[type].EMPTY,
    message: this.attribute(this.attrs.EMPTYMSG)
  };
};

ValidateAttribute.fn.ruleMin = function(){
  var vMin = this.min();
  var validate = vMin !==  null && !!vMin.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMin : null;
  var valid = !validate || value === null;
  var type = this.type();

  if (type === this.types.STRING) {
    valid = valid || this.getValue().length >= value;
  }
  else if (type === this.types.CHECKED){
    var name = this.name();
    
    if (name.match(/\[\]$/g)){
      var elements = this.dataSelector
      .map(function(selectors){
        return selectors.name === name ? selectors.elements : null;
      })
      .filter(function(se){
        return Array.isArray(se);
      });
console.log('ruleMin', elements)
      var checked = elements[0].filter(function(element){
        return element.checked;
      });

      valid = valid || checked.length >= value;
    }
    else{
      value = 1;
      validate = vMin === "" || +vMin > 0;
      valid = !validate || this.element().checked;
    }
  }

  return { 
    validate, value, valid, code: this.codes[type].MIN, 
    message: this.attribute(this.attrs.MINMSG)
  };
};

ValidateAttribute.fn.ruleMax = function(){
  var vMax = this.max();
  var validate = vMax !==  null && !!vMax.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMax : null;
  var valid = !validate || value === null;
  var type = this.type();

  if (type === this.types.STRING) {
    valid = valid || this.getValue().length <= value;
  }
  else if (type === this.types.CHECKED){
    var name = this.name();
    
    if (name.match(/\[\]$/g)){
      var elements = this.dataSelector
      .map(function(selectors){
        return selectors.name === name ? selectors.elements : null;
      })
      .filter(function(se){
        return Array.isArray(se);
      });

      var checked = elements[0].filter(function(element){
        return element.checked;
      });

      valid = valid || checked.length <= value;
    }
    else{
      value = 1;
    }
  }

  return { 
    validate, value, valid, code: this.codes[type].MAX,
    message: this.attribute(this.attrs.MAXMSG)
  };
};

ValidateAttribute.fn.rulesString = function(){
  return {
    isEmpty: this.ruleEmpty(),
    min: this.ruleMin(),
    max: this.ruleMax(),
    // same
    // regex
    // in
    // not in
  };
};

ValidateAttribute.fn.Number = function ValidateNumber(validate, element){
  this.validate = validate;
  this.element = element;
  this.integer = false;
  this.value = validate.getValue(element);
};

ValidateAttribute.fn.rulesChecked = function(){
  return { min: this.ruleMin(), max: this.ruleMax() };
}

ValidateAttribute.fn.File = function ValidateFile(validate, element){
  this.validate = validate;
  this.element = element;
};

ValidateAttribute.fn.Number.prototype.isInteger = function(){
  if (arguments.length){
    this.integer = arguments[0] === true;
    return this;
  }
  return this.integer;
};

ValidateAttribute.fn.element = function(){
  var length = this.dataSelector.length - 1;
  if (!~length) return null;

  var element = this.dataSelector[length].elements.pop();
  element && this.dataSelector[length].elements.push(element);

  return element ? element.element : null;
};

ValidateAttribute.fn.attribute = function(){
  var vaAttr = this.options.prefix + '-' + arguments[0];
  var element = this.element();

  if (arguments.length > 1){
    if (!element) return this;console.log(element);
    element.setAttribute(arguments[0], arguments[1]);

    if (arguments[2] === undefined || arguments[2] === true){
      element.setAttribute(vaAttr, arguments[1]);
    }
    
    return this;
  }
  else{
    if (!element) return null;
    var attrVal = element.getAttribute(vaAttr);

    if (attrVal === null){
      attrVal = element.getAttribute(arguments[0]);
    }

    return attrVal;
  }
};

ValidateAttribute.fn.name = function(){
  return this.attribute(this.attrs.NAME, ...arguments);
};

ValidateAttribute.fn.type = function(){
  return this.attribute(this.attrs.TYPE, ...arguments);
};

ValidateAttribute.fn.getValueAt = function(){
  return this.attribute(this.attrs.VALUEAT) || this.values.VALUE;
};

ValidateAttribute.fn.isEmpty = function(){
  return this.attribute(this.attrs.EMPTY, ...arguments);
};

ValidateAttribute.fn.min = function(){
  return this.attribute(this.attrs.MIN, ...arguments);
};

ValidateAttribute.fn.max = function(){
  return this.attribute(this.attrs.MAX, ...arguments);
};

ValidateAttribute.fn.getValue = function(){
  var element = this.element();
  if (!element) return '';

  var valueAt = this.getValueAt();
  
  switch(valueAt){
    case this.values.TEXT:
      return 'innerText' in element ? element.innerText : '';
    case this.values.HTML:
      return 'innerHTML' in element ? element.innerHTML : '';
    default:
      return 'value' in element ? element.value : '';
  }
};

ValidateAttribute.fn.getUrl = function(){
  return (
    this.options.url ||
    this.actionSelector.selector.getAttribute(this.options.prefix + '-' + this.attrs.ACTION) ||
    this.actionSelector.selector.getAttribute('action') ||
    window.location.href
  ); 
};

ValidateAttribute.fn.getEnctype = function(){
  var enctype = (
    this.options.enctype ||
    this.actionSelector.selector.getAttribute(this.options.prefix + '-' + this.attrs.ENCTYPE) ||
    this.actionSelector.selector.getAttribute('enctype') ||
    'multipart/form-data'
  );
  var format = {
    'multipart/form-data': 'multipart/form-data; charset=utf-8; boundary=' + Math.random().toString().substr(2),
    'application/x-www-form-urlencoded': 'application/x-www-form-urlencoded',
    'application/json': 'application/json'
  };

  return enctype in format ? format[enctype] : format['multipart/form-data'];
};

ValidateAttribute.fn.getMethod = function(){
  return (
    this.options.method ||
    this.actionSelector.selector.getAttribute(this.options.prefix + '-' + this.attrs.METHOD) ||
    this.actionSelector.selector.getAttribute('method') ||
    'GET'
  );
};

ValidateAttribute.fn.validator = function(){
  switch(this.type()){
    case this.types.STRING:
      return this.rulesString();
    case this.types.NUMBER:
      return new this.Number(this, element);
    case this.types.INTEGER:
      return new this.Number(this, element).isInteger(true);
    case this.types.CHECKED:
      return this.rulesChecked();
    default: return null;
  }
};

ValidateAttribute.fn.on = function(name, callback){
  name = 'on' + name;
  name in this && Object.assign(this, { [name]: callback });
  return this;
};

ValidateAttribute.fn.action = function(options){
  Object.assign(this.options, options);
  this.dataSelector = [];
  var action = this.actionSelector;
  
  if (!action.selector) return -1;

  this.onBeforeValidate && this.onBeforeValidate(action.selector);
  action.elements = [];
  var vaName = this.options.prefix + '-' + this.attrs.NAME;

  Array.from(action.selector.querySelectorAll('[name], [' + vaName + ']'))
  .map(function(element){
    return element.hasAttribute(vaName) ? element.getAttribute(vaName) : element.getAttribute('name');
  })
  .filter(function(name, index, _self){
    return name.length && _self.indexOf(name) === index;
  })
  .map(function(name){
    var qName = name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    var elementsName = action.selector.querySelectorAll('[' + vaName + '=' + qName + ']');
    action.elements.push({ name, elements : elementsName.length ? elementsName : 
    action.selector.querySelectorAll('[name=' + qName + ']') });
  });

  var self = this;
  var elementValid = true;
  var errors = [];

  console.log(action.elements);

  action.elements.map(function(selectors){
    if (!elementValid) return;

    Array.from(selectors.elements).map(function(element){
      if (!elementValid) return;
      var dataLength = self.dataSelector.length - 1;

      if (!!~dataLength && self.dataSelector[dataLength].name === selectors.name){
        self.dataSelector[dataLength].elements.push({ element, value: null, validator: null });
      }
      else{
        self.dataSelector.push({
          name: selectors.name,
          elements: [ { element, value: null, validator: null } ]
        });
        ++dataLength;
      }

      var length = self.dataSelector[dataLength].elements.length - 1;
      var lastElement = self.dataSelector[dataLength].elements[length];

      Object.assign(lastElement, { value: self.getValue(), validator: self.validator() });
      if (!lastElement.validator) return;

      var perNext = true;
      var rules = lastElement.validator;

      Object.keys(rules).map(function(rule){
        if (!perNext) return;
        if (rules[rule].valid) return;
        errors.push({ element, rule: rules[rule] });
        perNext = !self.onPerInvalid || self.onPerInvalid(element, rules[rule]) !== false;
      });

      elementValid = perNext;
    });
  });

  console.log(this);
  if (errors.length && elementValid){
    this.onValidateFailure && this.onValidateFailure(action.selector, errors);
    return -1;
  }

  if (!this.options.ajax){
    this.onValidateSuccess && this.onValidateSuccess(action);
    return this.options.removeSubmit === true  ? 0 : 1;
  }

  var data = this.getData();
  if (this.onBeforeSend && this.onBeforeSend(action.selector, data) === false) return 1;

  this.ajax({
    url: this.getUrl(),
    method: this.getMethod(),
    enctype: this.getEnctype(),
    data: data,
    success: this.onAjaxSuccess,
    error: this.onAjaxFailure
  });

  return 0;
};

ValidateAttribute.fn.getData = function(){
  switch (this.options.enctype){
    case 'application/json':
      return this.json();
    case 'application/x-www-form-urlencoded':
      return this.urlEncoded();
  }

  return this.formData();
};

ValidateAttribute.fn.formData = function(){
  var form = new FormData;
  var data = this.dataSelector;

  Object.keys(data).map(function(name){
    if (Array.isArray(data[name]) || data[name] instanceof FileList){
      Array.from(data[name]).map(function(key){
        form.append(name + '[]', data[name][key]);
      });
    }
    else{
      form.append(name, data[name]);
    }
  });

  form.processData = false;
  form.contentType = false;

  return form;
};

ValidateAttribute.fn.json = function(){
  var form = {};

  return form;
};

ValidateAttribute.fn.urlEncoded = function(){
  var form = '';

  return form;
};

ValidateAttribute.fn.ajax = function(params){
  if (!params || Array.isArray(params) || typeof params !== 'object') return this;
console.log('ajax :: params ::', params);
  var xhr = 'XMLHttpRequest' in window ? new XMLHttpRequest : new ActiveXObject('Microsoft.XMLHTTP');
  var self = this;

  xhr.onreadystatechange = function(){
    if (xhr.readyState === 4){
      if (xhr.status === 200){
        self.onAjaxSuccess &&
        self.onAjaxSuccess(self.actionSelector.selector, this, this.response);
      }
      else{
        self.onAjaxFailure &&
        self.onAjaxFailure(self.actionSelector.selector, this, new Error('Cannot handle request.'));
      }
    }
  };

  xhr.open(params.method, params.url, true);
  xhr.setRequestHeader('Content-Type', params.enctype);

  xhr.send(params.data);
  
  xhr.onload = function(){
    if (this.readyState === 1){
      console.log('here');
    }
    
  }

  return this;
};

ValidateAttribute.fn.addEventListener = function(eventName, handler){
  if (!this.querySelector || !this.querySelector.length) return this;

  Array.from(this.querySelector).map(function(selector){
    if (window.attachEvent){
      selector.attachEvent('on' + eventName, handler);
    }
    else if (window.addEventListener){
      selector.addEventListener(eventName, handler);
    }
    else{
      selector['on' + eventName] = handler;
    }
  });

  return this;
};

ValidateAttribute.fn.listen = function(options){
  if (!this.querySelector || !this.querySelector.length) return this;
  Object.assign(this.options, options);

  var self = this.addEventListener('submit', function(event){
    self.actionSelector.selector = this;
    self.action(options) === 1 || event.preventDefault();
  });

  return this;
};

function $va(selector, options){
  return new ValidateAttribute(selector, options);
}
