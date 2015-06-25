StateMap = function StateMap() {
  this._depsMap = {};
  this._valueMap = {};
};

StateMap.prototype.set = function(key, value, fireAway) {
  var dep = this._getDep(key);
  var existingValue = this._valueMap[key];
  
  // this is an optimization to pass big objects without
  // cloning and checking for equality
  if(fireAway) {
    this._valueMap[key] = {value: value, fireAway: true};
    dep.changed();
    return;
  }

  if(existingValue) {
    if(EJSON.equals(existingValue.value, value)) {
      return;
    }
  }

  this._valueMap[key] = {value: value};
  dep.changed();
};

StateMap.prototype.get = function(key) {
  this._getDep(key).depend();
  var info = this._valueMap[key];
  if(!info) {
    return info;
  } else if(info.fireAway) {
    return info.value;
  } else {
    return EJSON.clone(info.value);
  }
};

StateMap.prototype._getDep = function(key) {
  if(!this._depsMap[key]) {
    this._depsMap[key] = new Tracker.Dependency();
  }

  return this._depsMap[key];
};