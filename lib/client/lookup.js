var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation
  if(name == "get") {
    return FlowComponents.get;
  } else if(/^get\$/.test(name)) {
    var state = name.replace(/^get\$/, "");
    return FlowComponents.get(state);
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