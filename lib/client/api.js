FlowComponents = {};
// private store for only within the package namespace
ComponentsStore = {};

// Component definition api
FlowComponents.define = function define(name, createdCallback) {
  var stateDefs = {};
  var actionDefs = {};

  var ComponentInstanceClass = NewClass(ComponentInstance);
  var componentClass = ComponentsStore[name] = NewClass(Component);

  _.extend(componentClass.prototype, {
    name: name,
    created: createdCallback,
    stateDefs: stateDefs,
    actionDefs: actionDefs,
    componentInstanceClass: ComponentInstanceClass
  });

  return FlowComponents._makePublicComponentAPI(componentClass);
};

// find a component by it's name
FlowComponents.find = function find(name) {
  var componentClass = ComponentsStore[name];
  if(!componentClass) {
    throw new Error("can't find a component: ", name);
  }

  return FlowComponents._makePublicComponentAPI(componentClass);
};

FlowComponents._mixin = function _mixin(componentClass, mixinObject) {
  var componentClassProto = componentClass.prototype;

  if(mixinObject.action) {
    _.extend(componentClassProto.actionDefs, mixinObject.action);
  }

  if(mixinObject.state) {
    _.extend(componentClassProto.stateDefs, mixinObject.state);
  }

  if(mixinObject.prototype) {
    var instanceProto = componentClassProto.componentInstanceClass.prototype;
    _.extend(instanceProto, mixinObject.prototype);
  }

  return FlowComponents._makePublicComponentAPI(componentClass);
};

// get a state of current component
FlowComponents.get = function get() {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      return component._get.apply(component, arguments);
    }
  }
};

FlowComponents.getProp = function getProp(key) {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      return component._props[key];
    }
  }
};

// get a children of the current component
FlowComponents.child = function child(childId, currentView) {
  var currentView = currentView || Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    var child = component._children[childId];
    if(child) {
      return FlowComponents._buildProxy(child);
    }
  }
};

// build a proxy api for a child component with only
// `get` and `child` apis
FlowComponents._buildProxy = function _buildProxy(child) {
  var proxy = {
    get: function() {
      return child._get.apply(child, arguments);
    },
    child: function(childId) {
      return FlowComponents.child(childId, child.getView());
    },
    getProp: function() {
      return child._getProp.apply(child, arguments);
    }
  };

  return proxy;
};

FlowComponents._makePublicComponentAPI = function _makePublicComponentAPI(c) {
  var publicAPI =  {
    state: c.prototype.stateDefs,
    action: c.prototype.actionDefs,
    prototype: c.prototype.componentInstanceClass.prototype,
    mixin: FlowComponents._mixin.bind(null, c)
  }

  return publicAPI;
};

FlowComponents.emitAction = function emitAction(event) {
  var regexp = /^\$/;
  if(regexp.test(event)) {
    var privateEvent = event.replace(regexp, "");
    var currentView = Blaze.currentView;

    if(!currentView) {
      throw new Error(event + " needs be emit within view");
    }

    var component = GetComponent(currentView);
    if(!component) {
      throw new Error("there is no component for :" + event);
    }

    var args = _.toArray(arguments).slice(1);
    component.emitPrivateAction(privateEvent, args);
  } else {
    ActionHub.emit.apply(ActionHub, arguments);
  }
};

FlowComponents.onAction = function onAction(event, callback) {
  ActionHub.on(event, callback);
  var controller = {
    stop: function() {
      ActionHub.removeListener(event, callback);
    }
  };

  return controller;
};