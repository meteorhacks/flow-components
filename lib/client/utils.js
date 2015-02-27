GetComponent = function(topView) {
  var currView = topView;
  for(var lc=0; lc<100; lc++) {
    currView = Blaze._getParentView(currView);
    if(!currView) {
      return null;
    }

    var component = currView._component;
    if(component) {
      return component;
    }
  }
};

NewClass = function (base) {
  // We don't have more than 3 args.
  // So, 3 args is pretty okay.
  var newClass = function(v1, v2, v3) {
    base.call(this, v1, v2, v3);
  }

  _.extend(newClass.prototype, base.prototype);
  return newClass;
};