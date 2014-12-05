Component = function Component() {
  this._state = {};
  this._stateDep = new Tracker.Dependency;

  this._rendered = this._rendered.bind(this);
  this._destroyed = this._destroyed.bind(this);
}

Component.prototype._init = function _init(params) {
  if(this.options.created) {
    this.options.created.call(this, params);
  }
  return Template[this.options.template || this.name];
};

Component.prototype._rendered = function() {
  if(this.options.rendered) {
    this.options.rendered.call(this);
  }
};

Component.prototype._destroyed = function() {
  if(this.options.destroyed) {
    this.options.destroyed.call(this);
  }
};

Component.prototype.setState = function(newState) {
  _.extend(this._state, newState);
  this._stateDep.changed();
};