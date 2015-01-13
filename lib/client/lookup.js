var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation
  if(name == "get") {
    return FlowComponents.get;
  } else if(name == "prop") {
    return FlowComponents.getProp;
  }

  return originalLookup.call(this, name, options);
};