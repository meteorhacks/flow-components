Component = function Component() {
  this._state = {};
  this._stateDep = new Tracker.Dependency;

  this._init = this._init.bind(this);
  this._rendered = this._rendered.bind(this);
  this._destroyed = this._destroyed.bind(this);

  this._destroyedCallbacks = [];
  this._renderedCallback = [];
}

Component.prototype.setState = function(newState) {
  _.extend(this._state, newState);
  this._stateDep.changed();
};

Component.prototype.autorun = function(cb) {
  var self = this;
  var c = Tracker.autorun(function(computation) {
    cb.call(self, computation);
  });
  self._onDestroyed(function() {c.stop()});
};

Component.prototype._init = function _init(params) {
  if(this.options.created) {
    this.options.created.call(this, params);
  }

  if(this.options.destroyed) {
    this._onDestroyed(this.options.destroyed);
  }

  if(this.options.rendered) {
    this._onRendered(this.options.rendered);
  }
};

Component.prototype._getTemplate = function() {
  return Template[this.options.template || this.name];
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