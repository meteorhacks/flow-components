var instantId = 0;

Component = function Component() {
  this.id = ++instantId;
  this._init = this._init.bind(this);
  this._rendered = this._rendered.bind(this);
  this._destroyed = this._destroyed.bind(this);

  this._destroyedCallbacks = [];
  this._renderedCallback = [];

  this._state = new ReactiveDict('flow-component-state-' + this.id);
  this._props = {};
  this._propsOfChildren = {};
}

Component.prototype.autorun = function(cb) {
  var self = this;
  var c = Tracker.autorun(function(computation) {
    cb.call(self, computation);
  });
  self.onDestroyed(function() {c.stop()});
};

Component.prototype.get = function(key) {
  return this._state.get(key);
};

Component.prototype.set = function(key, value) {
  return this._state.set(key, value);
};

Component.prototype._get = function(name) {
  var args = _.toArray(arguments);
  args.pop();
  args.shift();

  if(typeof this.getters[name] == "function") {
    return this.getters[name].apply(this, args);
  } else if(typeof this.getters[name] !== "undefined") {
    return this.getters[name];
  } else {
    return this._state.get(name);
  }
};

Component.prototype.onAction = function(action, callback) {
  callback = callback.bind(this);
  ActionHub.on(action, callback);
  var removeListener = _.once(function() {
    ActionHub.removeListener(action, callback);
  });

  this.onDestroyed(removeListener);

  return {
    stop: removeListener
  };
};

Component.prototype._init = function _init(params) {
  if(this.created) {
    this.created.call(this, params);
  }

  if(this.destroyed) {
    this.onDestroyed(this.destroyed);
  }

  if(this.rendered) {
    this.onRendered(this.rendered);
  }
};

Component.prototype._getTemplate = function() {
  return Template[this.template || this.name];
};

Component.prototype._rendered = function() {
  _.each(this._renderedCallback, function(cb) {
    cb();
  });
};

Component.prototype._destroyed = function() {
  _.each(this._destroyedCallbacks, function(cb) {
    cb();
  });
};

Component.prototype.onDestroyed = function(cb) {
  this._destroyedCallbacks.push(cb.bind(this));
};

Component.prototype.onRendered = function(cb) {
  this._renderedCallback.push(cb.bind(this));
};