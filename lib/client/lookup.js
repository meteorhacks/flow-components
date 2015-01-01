var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation  
  if(name == "get") {
    var component = GetComponent(this);
    if(component) {
      return component._get.bind(component);
    }
  }

  return originalLookup.call(this, name, options);
};