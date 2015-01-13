GetComponent = function(topView) {
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

NewClass = function (base) {
  var newClass = function(v1, v2, v3) {
    base.call(this, v1, v2, v3);
  }

  _.extend(newClass.prototype, base.prototype);
  return newClass;
};