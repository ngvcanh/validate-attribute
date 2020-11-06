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
    EMAIL: 'email',
    NUMBER: 'number',
    INTEGER: 'integer',
    CHECKED: 'checked',
    MCHECKED: 'mchecked'
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
    REGEX: 'regex',
    REGEXMSG: 'regex-msg',
    INTMSG: 'int-msg',
    TYPEMSG: 'type-msg',
    SEND: 'send',
    MAPCHECKED: 'map-checked',
    MTYPE: 'mtype',
    IN: 'in',
    INMSG: 'in-msg',
    NOTIN: 'not-in',
    NOTINMSG: 'not-in-msg',
    RMIN: 'rmin',
    RMINMSG: 'rmin-msg',
    RMAX: 'rmax',
    RMAXMSG: 'rmax-msg',
    ELEMENT: 'element'
  };

  this.values = {
    HTML: 'html',
    TEXT: 'text',
    MAPELEMENT: 'map-element',
    VALUE: 'value'
  };

  this.codes = {
    EMPTY: 'VA_EMPTY',
    MIN: 'VA_MIN',
    MAX: 'VA_MAX',
    INTEGER: 'VA_INTEGER_TYPE',
    NUMBER: 'VA_NUMBER_TYPE',
    IN: 'VA_IN',
    NOTIN: 'VA_NOT_IN',
    SAME: 'VA_SAME',
    RMIN: 'VA_RATHER_MIN',
    RMAX: 'VA_RATHER_MAX',
    TYPE: 'VA_TYPE',
    REGEX: 'VA_REGEX'
  };
  
  return this;
}

ValidateAttribute.fn = ValidateAttribute.prototype;

ValidateAttribute.fn.isEmpty = function(obj){
  switch(typeof obj){
    case 'string': return !obj.length;
    case 'bigint':
    case 'number': return obj === 0;
    case 'function':
    case 'undefined': return true;
    case 'boolean': return !obj;
  }

  if (Array.isArray(obj)) return !obj.length;
  if (obj === null) return true;

  for (var _name in obj){
    return false;
  }

  return true;
};

ValidateAttribute.fn.ruleEmpty = function(){
  var value = this.empty();
  var validate = value === 'false';

  value = !validate;
  var valid = !validate || value || !!this.getValue().length;

  return { 
    validate, value, valid, type: this.type(), code: this.codes.EMPTY,
    message: this.attribute(this.attrs.EMPTYMSG)
  };
};

ValidateAttribute.fn.ruleMin = function(){
  var vMin = this.min();
  var validate = vMin !==  null && !!vMin.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMin : null;
  var valid = !validate || value === null;
  var type = this.type();

  type === this.types.INTEGER && (type = this.types.NUMBER);
  
  if (type === this.types.STRING) {
    valid = valid || this.getValue().length >= value;
  }
  else if (type === this.types.NUMBER){
    valid = valid || +this.getValue() >= value;
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

      valid = valid || checked.length >= value;
    }
    else{
      value = 1;
      validate = vMin === "" || +vMin > 0;
      valid = !validate || this.element().checked;
    }
  }

  return { 
    validate, value, code: this.codes.MIN, type: this.type(),
    valid, message: this.attribute(this.attrs.MINMSG)
  };
};

ValidateAttribute.fn.ruleRatherMin = function(){
  var vMin = this.ratherMin();
  var validate = vMin !==  null && !!vMin.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMin : null;
  var valid = !validate || value === null;
  var type = this.type();

  type === this.types.INTEGER && (type = this.types.NUMBER);
  
  if (type === this.types.STRING) {
    valid = valid || this.getValue().length > value;
  }
  else if (type === this.types.NUMBER){
    valid = valid || +this.getValue() > value;
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

      valid = valid || checked.length > value;
    }
    else{
      value = 1;
      validate = vMin === "" || +vMin > 0;
      valid = !validate || this.element().checked;
    }
  }

  return { 
    validate, value, code: this.codes.RMIN, type: this.type(),
    valid, message: this.attribute(this.attrs.RMINMSG)
  };
};

ValidateAttribute.fn.ruleMax = function(){
  var vMax = this.max();
  var validate = vMax !==  null && !!vMax.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMax : null;
  var valid = !validate || value === null;
  var type = this.type();

  type === this.types.INTEGER && (type = this.types.NUMBER);

  if (type === this.types.STRING) {
    valid = valid || this.getValue().length <= value;
  }
  else if (type === this.types.NUMBER){
    valid = valid || +this.getValue() <= value;
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
    validate, value, valid, code: this.codes.MAX,
    message: this.attribute(this.attrs.MAXMSG)
  };
};

ValidateAttribute.fn.ruleRatherMax = function(){
  var vMax = this.ratherMax();
  var validate = vMax !==  null && !!vMax.match(/^\d+(\.\d+)?$/g);
  var value = validate ? +vMax : null;
  var valid = !validate || value === null;
  var type = this.type();

  type === this.types.INTEGER && (type = this.types.NUMBER);

  if (type === this.types.STRING) {
    valid = valid || this.getValue().length < value;
  }
  else if (type === this.types.NUMBER){
    valid = valid || +this.getValue() < value;
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

      valid = valid || checked.length < value;
    }
    else{
      value = 1;
    }
  }

  return { 
    validate, value, valid, code: this.codes.RMAX,
    message: this.attribute(this.attrs.RMAXMSG)
  };
};

ValidateAttribute.fn.ruleInteger = function(){
  var type = this.type();

  var validate = type === this.types.INTEGER;
  var valid = !validate || !!this.getValue().match(/^0|(\-?[1-9]\d*)$/g);

  return { 
    validate, value: null, valid, code: this.codes.INTEGER, 
    message: this.attribute(this.attrs.INTMSG)
  };
};

ValidateAttribute.fn.ruleNumber = function(){
  var type = this.type();

  var validate = type === this.types.NUMBER;
  var valid = !validate || !!this.getValue().match(/^(0|(\-?[1-9]\d*))(\.\d+)?$/g);
  
  return {
    validate, value: null, valid, type: this.type(),
    code: this.codes.TYPE, message: this.attribute(this.attrs.TYPEMSG)
  };
};

ValidateAttribute.fn.ruleRegex = function(){
  var regex = this.regex();
  var validate = regex !== null;
  var type = this.type();
  var self = this;

  try{ var value = regex ? JSON.parse(regex): [] }catch(e){ value = [] }

  if (type === this.types.EMAIL){
    value = [ "^[a-zA-Z\\d\\-_]+@([a-zA-Z\\d\\-_]+\\.){1,2}[a-zA-Z]{2,}$" ];
  }
  
  var valid = !value.length || !!value.filter(function(reg){ console.log(self.getValue(), new RegExp(reg))
    return self.getValue().match(new RegExp(reg)) 
  }).length
  
  return { 
    validate, value, valid, code: this.codes.REGEX, type: this.type(),
    message: this.attribute(this.attrs.REGEXMSG) 
  };
};

ValidateAttribute.fn.ruleIn = function(){
  var value = this.in();
  var validate = value !== null;

  if (validate){
    try{ 
      value && (value = JSON.parse(value)); 
      value = Array.isArray(value) ? value : [];
    }
    catch(e){ 
      value = [];
    }
  }

  var valid = !validate || !!~value.indexOf(this.getValue());

  return {
    validate, value, valid, code: this.codes.IN, type: this.type(),
    message: this.attribute(this.attrs.IN)
  };
};

ValidateAttribute.fn.ruleNotIn = function(){
  var value = this.notIn();
  var validate = value !== null;

  if (validate){
    try{ 
      value && (value = JSON.parse(value)); 
      value = Array.isArray(value) ? value : [];
    }
    catch(e){ 
      value = [];
    }
  }

  var valid = !validate || !~value.indexOf(this.getValue());

  return {
    validate, value, valid, code: this.codes.NOTIN, type: this.type(),
    message: this.attribute(this.attrs.NOTIN)
  };
};

ValidateAttribute.fn.ruleSame = function(){
  return {
    validate: false,
    value: null,
    valid: true,
    code: this.codes.SAME,
    type: this.type(),
    message: null
  };
};

ValidateAttribute.fn.getRules = function(){
  return [
    this.ruleEmpty(),
    this.ruleNumber(),
    this.ruleInteger(),
    this.ruleRegex(),
    this.ruleMin(),
    this.ruleRatherMin(),
    this.ruleMax(),
    this.ruleRatherMax(),
    this.ruleIn(),
    this.ruleNotIn(),
    this.ruleSame()
  ];
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

ValidateAttribute.fn.empty = function(){
  return this.attribute(this.attrs.EMPTY, ...arguments);
};

ValidateAttribute.fn.min = function(){
  return this.attribute(this.attrs.MIN, ...arguments);
};

ValidateAttribute.fn.ratherMin = function(){
  return this.attribute(this.attrs.RMIN, ...arguments);
};

ValidateAttribute.fn.max = function(){
  return this.attribute(this.attrs.MAX, ...arguments);
};

ValidateAttribute.fn.ratherMax = function(){
  return this.attribute(this.attrs.RMAX, ...arguments);
};

ValidateAttribute.fn.regex = function(){
  return this.attribute(this.attrs.REGEX, ...arguments);
};

ValidateAttribute.fn.mapChecked = function(){
  return this.attribute(this.attrs.MAPCHECKED, ...arguments);
};

ValidateAttribute.fn.in = function(){
  return this.attribute(this.attrs.IN, ...arguments);
};

ValidateAttribute.fn.notIn = function(){
  return this.attribute(this.attrs.NOTIN, ...arguments);
};

ValidateAttribute.fn.ratherMin = function(){
  return this.attribute(this.attrs.RMIN, ...arguments);
}

ValidateAttribute.fn.attrElement = function(){
  return this.attribute(this.attrs.ELEMENT, ...arguments);
};

ValidateAttribute.fn.getValue = function(){
  var element = this.element();console.log(element);
  if (!element) return '';

  var name = this.name();
  var isMulti = !!name.match(/\[\]$/g);

  if ('file' === element.type){
    return isMulti ? element.files : element.files[0];
  }

  var valueAt = this.getValueAt();

  switch(valueAt){
    case this.values.TEXT:
      return 'innerText' in element ? element.innerText : '';
    case this.values.HTML:
      return 'innerHTML' in element ? element.innerHTML : '';
    case this.values.MAPELEMENT:
      var elSelector = this.attrElement();console.log(elSelector);
      if (!elSelector) return '';

      var el = this.actionSelector.selector.querySelectorAll(elSelector);console.log(el);
      if (!el.length) return '';

      if (isMulti){
        var result = [];
        
        Array.from(el).map(function(e){
          e.type === 'file' ? 
          Array.from(e.files).map(function(f){
            result.push(f);
          }) : 
          result.push('value' in e ? e.value : e.innerHTML);
        });

        return result;
      }
      else{
        el = el[0];
        return 'file' === el.type ? el.files[0] : 
        'value' in el ? el.value : el.innerHTML;
      }
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
  var query = this.mapChecked();
  
  if (query !== null){
    var selector = document.querySelector(query);
    if (!selector || !selector.checked) return [];
  }

  return this.getRules();
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
  console.log(this);

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

      lastElement.validator.map(function(rule){
        if (!perNext) return;
        if (rule.valid) return;
        errors.push({ element, rule });
        perNext = !self.onPerInvalid || self.onPerInvalid(element, rule) !== false;
      });

      elementValid = perNext;
    });
  });

  console.log(this);
  if (errors.length){
    elementValid && this.onValidateFailure && this.onValidateFailure(action.selector, errors);
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
  var self = this;

  this.isEmpty(this.dataSelector) || this.dataSelector.map(function(selectors){
    self.isEmpty(selectors.elements) || selectors.elements.map(function(elementInfo){
      var send = elementInfo.element.getAttribute(self.options.prefix + '-' + self.attrs.SEND);
      var type = elementInfo.element;
console.log('formData')
      if (
        send === 'false' ||
        ((type === 'checkbox' || type === 'radio') && !elementInfo.element.checked)
      ) return;

      if (Array.isArray(elementInfo.value) || elementInfo.value instanceof FileList){
        self.isEmpty(elementInfo.value) || Array.from(elementInfo.value).map(function(value){
          form.append(selectors.name, value);
        });
      }
      else{
        form.append(selectors.name, elementInfo.value);
      }
    });
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
  xhr.send(params.data);
  
  return this;
};

ValidateAttribute.fn.addEventListener = function(eventName, handler){
  if (this.isEmpty(this.querySelector)) return this;

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
  if (this.isEmpty(this.querySelector)) return this;
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

typeof module === 'object' && typeof module.exports === 'object' && (module.exports = $va);
