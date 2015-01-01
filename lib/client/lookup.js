var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation  
  if(name == "get") {
    var component = getComponent(this);
    if(component) {
      return component._get.bind(component);
    }
  }

  return originalLookup.call(this, name, options);
};

FlowComponents.get = function() {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = getComponent(currentView);
    if(component) {
      return component._get.apply(component, arguments);
    }
  }
};

function getComponent(topView) {
  var currView = topView;
  for(var lc=0; lc<100; lc++) {
    currView = Blaze._getParentView(currView);
    if(!currView) {
      return null;
    }

    if(currView._component) {
      return currView._component;
    }
  }
};