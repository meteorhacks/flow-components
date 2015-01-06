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
  var newClass = function() {
    base.call(this);
  }

  _.extend(newClass.prototype, base.prototype);
  return newClass;
};