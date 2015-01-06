var instantId = 0;

Component = function Component() {
  this.id = ++instantId;
  this._init = this._init.bind(this);
  this._rendered = this._rendered.bind(this);
  this._destroyed = this._destroyed.bind(this);

  this._props = {};
  this._propsOfChildren = {};
  this._instance = new this.componentInstanceClass();
}

Component.prototype._get = function(name) {
  var args = _.toArray(arguments);
  args.pop();
  args.shift();

  if(typeof this.stateDefs[name] == "function") {
    return this.stateDefs[name].apply(this._instance, args);
  } else if(typeof this.stateDefs[name] !== "undefined") {
    return this.stateDefs[name];
  } else {
    return this._instance._state.get(name);
  }
};

Component.prototype._init = function _init(params, view) {
  if(this.created) {
    this._instance._view = view;
    this.created.call(this._instance, params);
  }

  if(this.destroyed) {
    this._instance.onDestroyed(this.destroyed);
  }

  if(this.rendered) {
    this._instance.onRendered(this.rendered);
  }
};

Component.prototype._getTemplate = function() {
  return Template[this.template || this.name];
};

Component.prototype._rendered = function() {
  _.each(this._instance._renderedCallback, function(cb) {
    cb();
  });
};

Component.prototype._destroyed = function() {
  _.each(this._instance._destroyedCallbacks, function(cb) {
    cb();
  });
};

Component.prototype.emitPrivateAction = function(privateEvent, args) {
  var action = this.actionDefs[privateEvent];
  if(!action) {
    throw new Error("there is no such private action: " + this.name + ".action." + privateEvent);
  }

  action.apply(this._instance, args);
};