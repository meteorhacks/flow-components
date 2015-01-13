FlowComponents = {};
// private store for only within the package namespace
ComponentsStore = {};

// Component definition api
FlowComponents.define = function(name, createdCallback) {
  var stateDefs = {};
  var actionDefs = {};

  var ComponentInstanceClass = NewClass(ComponentInstance);
  ComponentsStore[name] = NewClass(Component);

  _.extend(ComponentsStore[name].prototype, {
    name: name,
    created: createdCallback,
    stateDefs: stateDefs,
    actionDefs: actionDefs,
    componentInstanceClass: ComponentInstanceClass
  });

  return {
    state: stateDefs,
    action: actionDefs,
    prototype: ComponentInstanceClass.prototype
  }
};

// find a component by it's name
FlowComponents.find = function(name) {
  var component = ComponentsStore[name];
  if(!component) {
    throw new Error("can't find a component: ", name);
  }

  return {
    state: component.prototype.stateDefs,
    action: component.prototype.actionDefs,
    prototype: component.prototype.componentInstanceClass.prototype
  }
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