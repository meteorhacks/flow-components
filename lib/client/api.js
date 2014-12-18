FlowComponents = {};
var ComponentsStore = {};

// Component definition api
FlowComponents.define = function(name, createdCallback) {
  ComponentsStore[name] = function() {
    Component.call(this);
  };

  _.extend(ComponentsStore[name].prototype, {
    name: name,
    created: createdCallback,
    getters: {}
  });
  _.extend(ComponentsStore[name].prototype, Component.prototype);

  return ComponentsStore[name].prototype.getters;
};

Template.render = new Template("Template.render", function() {
  var view = this;
  var componentName = Spacebars.call(view.lookup("component"));
  var params = Blaze._parentData(0);

  if(!componentName) {
    throw new Error("FlowComponent needs 'component' parameter");
  }

  if(!ComponentsStore[componentName]) {
    throw new Error("No such FlowComponent: " + componentName);
  }

  var paramsOfChildren = {};
  var component = new (ComponentsStore[componentName]);
  var templateIntance = component._getTemplate();
  var data = {
    state: component._state,
    params: params,
    component: function(id) {
      return paramsOfChildren[id];
    },
    _paramsOfChildren: paramsOfChildren,
    trigger: function(eventName, value) {
      if(typeof params[eventName] == "function") {
        params[eventName](value, params);
      }
    }
  };

  var view = Blaze._TemplateWith(data, function() {
    return Spacebars.include(templateIntance);
  });

  var parentComponentViewData = findParentComponentData();
  if(params.id && parentComponentViewData) {
    parentComponentViewData._paramsOfChildren[params.id] = params;
    view.onViewDestroyed(function() {
      delete parentComponentViewData._paramsOfChildren[params.id];
    }); 
  }

  view.onViewCreated(component._init);
  view._onViewRendered(component._rendered);
  view.onViewDestroyed(component._destroyed);
  view._component = component;

  return view;
});

function findParentComponentData () {
  for(var lc=1; lc<=10; lc++) {
    var parentData = Blaze._parentData(lc);
    if(parentData && parentData._paramsOfChildren) {
      return parentData;
    }
  }
}

var currentLayoutName = null;
var currentLayout = null;
var currentRegions = new ReactiveDict;
FlowComponents.renderLayout = function(layout, regions) {
  var rootDomNode = $('#__flow-main').get(0);
  if(currentLayoutName != layout) {
    var data = {};
    _.each(regions, function(value, key) {
      currentRegions.set(key, value);
      data[key] = function() {
        return currentRegions.get(key);
      };
    });

    // remove old view
    if(currentLayout) {
      Blaze._destroyView(currentLayout);
      $(rootDomNode).html('');
    }
    
    currentLayout = Blaze._TemplateWith(data, function() {
      return Spacebars.include(Template[layout]);
    });


    Blaze.render(currentLayout, rootDomNode);
    currentLayoutName = layout;
  } else {
    _.each(regions, function(value, key) {
      currentRegions.set(key, value);
    });
  }
};

FlowComponents.createAction = ActionHub.emit.bind(ActionHub);