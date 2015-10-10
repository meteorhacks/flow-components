var instantId = 0;

Component = function Component(props, wrapperView, parent) {
  this.id = ++instantId;
  this._instance = new this.componentInstanceClass(this);
  this._view = this._createView(props);
  this._children = {};
  this._props = props;
  this._parent = parent;

  this.flowContentBlock = wrapperView.templateContentBlock;
  this.flowElseBlock = wrapperView.templateElseBlock;
  this._blockMode = !!(this.flowContentBlock || this.flowElseBlock);
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

Component.prototype._getStateFn = function(name) {
  var self = this;
  return function() {
    return function() {
      return self._getState(name);
    };
  };
};

Component.prototype._getState = function(name) {
  var self = this;
  var args = _.toArray(arguments);
  args.pop();
  args.shift();

  if(typeof self.stateDefs[name] == "function") {
    return self.stateDefs[name].apply(self._instance, args);
  } else if(typeof self.stateDefs[name] !== "undefined") {
    return self.stateDefs[name];
  } else {
    var value = self._instance._state.get(name);
    // If we are inside a component rendered as _blockMode, we should allow
    // to access the parent component's data context.
    // This is how we do it.
    if(value === undefined && this._blockMode && self._parent) {
      // we can check it from the parent.
      return Component.prototype._getState.apply(self._parent, arguments);
    } else {
      return value;
    }
  }
};

Component.prototype._init = function _init(params, view) {
  var self = this;
  self._instance._view = view;

  // Invoke mixin's created callbacks
  _.each(self.created, function(fn) {
    fn.call(self._instance, params);
  });
  // Invoke constructor
  // this needs to done after the mixin has been called
  // otherwise we can't access properties added by mixins
  self.constructor.call(self._instance, params);

  // Register mixins' rendered callbacks
  _.each(self.rendered, function(fn) {
    self._instance.onRendered(fn);
  });

  // Register mixins' destroyed callbacks
  _.each(self.destroyed, function(fn) {
    self._instance.onDestroyed(fn);
  });
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

Component.prototype._getPrivateAction = function(actionName) {
  var action = this.actionDefs[actionName];
  // we need to bind the instance like this
  // otherwise, we'll get the incorrect instance when getting action 
  // from a parent
  if(action) {
    action = action.bind(this._instance);
  }

  // When we are inside a block we need to get the action from the parent
  if(!action && this._blockMode && this._parent) {
    action = this._parent._getPrivateAction(actionName);
  }

  return action;
};

Component.prototype.emitPrivateAction = function(privateEvent, args) {
  var action = this._getPrivateAction(privateEvent);

  if(!action) {
    throw new Error("there is no such private action: " + this.name + ".action." + privateEvent);
  }

  // action is already bound to it's instance (done by _getPrivateAction)
  // that's why we set the context as null
  var response = action.apply(null, args);

  // if avoidpromises is true, we need pass the response directly
  if(FlowComponents._avoidPromises.get()) {
    return response;
  }
  
  if(response instanceof Promise) {
    return response;
  } else {
    // we need to send a promise anyway
    return Promise.resolve(response);
  }
};