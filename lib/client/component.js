Component = function Component() {
  this._init = this._init.bind(this);
  this._rendered = this._rendered.bind(this);
  this._destroyed = this._destroyed.bind(this);

  this._destroyedCallbacks = [];
  this._renderedCallback = [];
}

Component.prototype.autorun = function(cb) {
  var self = this;
  var c = Tracker.autorun(function(computation) {
    cb.call(self, computation);
  });
  self._onDestroyed(function() {c.stop()});
};

Component.prototype.getHelper = function(name) {
  var args = _.toArray(arguments);
  args.pop();
  args.shift();

  if(typeof this[name] == "function") {
    return this[name].apply(this, args);
  } else {
    return this[name];
  }
};

Component.prototype.onAction = function(action, callback) {
  ActionHub.on(action, callback);
  var removeListener = _.once(function() {
    ActionHub.removeListener(action, callback);
  });

  this._onDestroyed(removeListener);

  return {
    stop: removeListener
  };
};

Component.prototype._init = function _init(params) {
  if(this.created) {
    this.created.call(this, params);
  }

  if(this.destroyed) {
    this._onDestroyed(this.destroyed);
  }

  if(this.rendered) {
    this._onRendered(this.rendered);
  }
};

Component.prototype._getTemplate = function() {
  return Template[this.template || this.name];
};

Component.prototype._rendered = function() {
  _.each(this._renderedCallback, function(cb) {
    cb.call(this);
  });
};

Component.prototype._destroyed = function() {
  _.each(this._destroyedCallbacks, function(cb) {
    cb.call(this);
  });
};

Component.prototype._onDestroyed = function(cb) {
  this._destroyedCallbacks.push(cb);
};

Component.prototype._onRendered = function(cb) {
  this._renderedCallback.push(cb);
};