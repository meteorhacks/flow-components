FlowComponents = {};
// private store for only within the package namespace
ComponentsStore = {};

// Component definition api
FlowComponents.define = function define(name, constructor) {
  var stateDefs = {};
  var actionDefs = {};

  var ComponentInstanceClass = NewClass(ComponentInstance);
  var componentClass = ComponentsStore[name] = NewClass(Component);

  _.extend(componentClass.prototype, {
    name: name,
    constructor: constructor,
    created: [],
    rendered: [],
    destroyed: [],
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

  // extend with life cycle hooks
  _.each(['created', 'rendered', 'destroyed'], function(event) {
    if(mixinObject[event]) {
      componentClass.prototype[event].push(mixinObject[event]);
    }
  });

  return FlowComponents._makePublicComponentAPI(componentClass);
};

// get a state of current component
FlowComponents.getState = function getState() {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      return component._getState.apply(component, arguments);
    }
  }
};

// get a state of current component as a function
FlowComponents.getStateFn = function getStateFn() {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      return component._getStateFn.apply(component, arguments);
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

FlowComponents.children = function children(currentView) {
  var currentView = currentView || Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    var children = [];
    _.each(component._children, function(child) {
      children.push(FlowComponents._buildProxy(child));
    });

    return children;
  }
};

// build a proxy api for a child component with only
// `get` and `child` apis
FlowComponents._buildProxy = function _buildProxy(child) {
  var proxy = {
    getState: function() {
      return child._getState.apply(child, arguments);
    },
    child: function(childId) {
      return FlowComponents.child(childId, child.getView());
    },
    children: function() {
      return FlowComponents.children(child.getView());
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
    extend: extend
  }

  function extend() {
    var mixins = _.toArray(arguments);
    var publicAPIComponent;
    mixins.forEach(function(mixin) {
      publicAPIComponent = FlowComponents._mixin(c, mixin);
    });

    return publicAPIComponent;
  }

  return publicAPI;
};

FlowComponents.callAction = function callAction(action) {
  var currentView = Blaze.currentView;

  if(!currentView) {
    throw new Error(action + " needs to be called within view");
  }

  var component = GetComponent(currentView);
  if(!component) {
    throw new Error("there is no component available for the action:" + action);
  }

  var args = _.toArray(arguments).slice(1);
  component.emitPrivateAction(action, args);
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