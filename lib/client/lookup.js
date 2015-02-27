var originalLookup = Blaze.View.prototype.lookup;

Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation
  if(/^state\$/.test(name)) {
    var state = name.replace(/^state\$/, "");
    return FlowComponents.getState.bind(null, state);
  } else if(/^stateFn\$/.test(name)) {
    var state = name.replace(/^stateFn\$/, "");
    return FlowComponents.getStateFn(state);
  } else if(/^action\$/.test(name)) {
    var actionName = name.replace(/^action\$/, "");
    return getAction(actionName);
  } else if(name == "prop") {
    return FlowComponents.getProp;
  } else if(name == "flowContentBlock") {
    return getBlock(name);
  } else if(name == "flowElseBlock") {
    return getBlock(name);
  }

  return originalLookup.call(this, name, options);
};

function getBlock(blockName) {
  var currentView = Blaze.currentView;
  if(!currentView) return;

  var component = GetComponent(currentView);
  if(!component) return;

  return component[blockName];
}

function getAction(actionName) {
  var component = GetComponent(Blaze.currentView);
  if(!component) {
    var msg = "There is no component to find an action named: " + actionName;
    throw new Error(msg);
  }

  // having two functions is important.
  // blaze run the first function, that's why we need to focus.
  return function() {
    return function() {
      component.emitPrivateAction(actionName, arguments);
    }
  };
}