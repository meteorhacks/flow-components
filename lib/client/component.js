var instantId = 0;

Component = function Component(props, wrapperView) {
  this.id = ++instantId;
  this._instance = new this.componentInstanceClass();
  this._view = this._createView(props);
  this._children = [];
  this._props = props;

  this.flowContentBlock = wrapperView.templateContentBlock;
  this.flowElseBlock = wrapperView.templateElseBlock;
}

Component.prototype.getView = function getView() {
  return this._view;
};

Component.prototype._createView = function(props) {
  var templateIntance = this._getTemplate();
  var view = Blaze._TemplateWith({}, function() {
    return Spacebars.include(templateIntance);
  });

  view.onViewCreated(this._init.bind(this, props, view));
  view._onViewRendered(this._rendered.bind(this));
  view.onViewDestroyed(this._destroyed.bind(this));
  view._component = this;

  return view;
};

Component.prototype._getFn = function(name) {
  var self = this;
  return function() {
    return function() {
      return self._get(name);
    };
  };
};

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
    // Even though we fired the rendered callback,
    // the DOM is not ready yet!
    // We can make sure DOM is ready with this trick.
    Tracker.afterFlush(cb);
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