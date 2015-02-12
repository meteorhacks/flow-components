var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation
  if(name == "get") {
    return FlowComponents.get;
  } else if(name == "getFn") {
    return FlowComponents.getFn;
  } else if(/^get\$/.test(name)) {
    var state = name.replace(/^get\$/, "");
    return FlowComponents.get(state);
  } else if(/^getFn\$/.test(name)) {
    var state = name.replace(/^getFn\$/, "");
    return FlowComponents.getFn(state);
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