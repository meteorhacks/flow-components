var originalLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function(name, options) {
  // FIXME: need a better implementation
  if(name == "canShowPackage") {
    debugger;
  }
  var compData = getComponentData(this);
  if(compData) {
    var lookupData = compData.get(name);
    if(typeof lookupData === "function") {
      var data = Blaze.getData();
      return lookupData.call(data);
    } else if(lookupData) {
      return lookupData;
    }
  }

  return originalLookup.call(this, name, options);
};

function getComponentData(currentView) {
  for(var lc=0; lc<100; lc++) {
    var data = Blaze._parentData(lc);
    if(!data) {
      return null;
    }

    if(data.state) {
      return data.state;
    }
  }
};