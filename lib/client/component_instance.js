var instantId = 0;

ComponentInstance = function() {
  this.id = ++instantId;
  this._state = new ReactiveDict('flow-component-state-' + this.id);
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
  return this._state.get(key);
};

ComponentInstance.prototype.set = function(key, value) {
  return this._state.set(key, value);
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
    window.aaa = this._view;
    return this._view._domrange.$(query);
  } else {
    return $();
  }
};

// _.each(['findAll', 'find', '$'], function(fnName) {
//   ComponentInstance.prototype[fnName] = function(arg1) {
//     return this._view[fnName].call(this._view, arg1);
//   };
// });