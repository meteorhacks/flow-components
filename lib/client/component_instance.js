var instantId = 0;

ComponentInstance = function(component) {
  this._component = component;
  this.id = ++instantId;
  this._state = new ReactiveDict();
  this._destroyedCallbacks = [];
  this._renderedCallback = [];
};

ComponentInstance.prototype.autorun = function(cb) {
  var self = this;
  var c = Tracker.autorun(function(computation) {
    cb.call(self, computation);
  });
  self.onDestroyed(function() {c.stop()});
};

ComponentInstance.prototype.get = function(key) {
  return this._component._get(key);
};

ComponentInstance.prototype.set = function(key, value) {
  return this._state.set(key, value);
};

ComponentInstance.prototype.setFn = function(key, fn) {
  if(typeof fn !== 'function') return;

  this.autorun(function() {
    this.set(key, fn());
  });
};

ComponentInstance.prototype.onAction = function(action, callback) {
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

ComponentInstance.prototype.onDestroyed = function(cb) {
  this._destroyedCallbacks.push(cb.bind(this));
};

ComponentInstance.prototype.onRendered = function(cb) {
  this._renderedCallback.push(cb.bind(this));
};

ComponentInstance.prototype.find = function(query) {
  return this.$(query).get(0);
};

ComponentInstance.prototype.findAll = function(query) {
  return this.$(query).toArray();
};

ComponentInstance.prototype.$ = function(query) {
  if(this._view._domrange) {
    return this._view._domrange.$(query);
  } else {
    return $();
  }
};