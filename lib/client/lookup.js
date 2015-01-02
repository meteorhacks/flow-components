var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation  
  if(name == "get") {
    return FlowComponents.get;
  } else if(name == "prop") {
    var props = FlowComponents.getProps();
    return function(name) {
      if(props) {
        return props[name];
      }
    };
  }

  return originalLookup.call(this, name, options);
};