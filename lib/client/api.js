LeanComponents = {};
var ComponentsStore = {};

// Component definition api
LeanComponents.define = function(name, options) {
  ComponentsStore[name] = function() {
    Component.call(this);
  };

  _.extend(ComponentsStore[name].prototype, {
    name: name,
    options: options
  });
  _.extend(ComponentsStore[name].prototype, Component.prototype);
};

Template.render = new Template("Template.render", function() {
  var view = this;
  var componentName = Spacebars.call(view.lookup("component"));
  var params = Blaze._parentData();

  if(!componentName) {
    throw new Error("leanComponent needs 'component' parameter");
  }

  if(!ComponentsStore[componentName]) {
    throw new Error("No such leanComponent: " + componentName);
  }

  var component = new (ComponentsStore[componentName]);
  var templateIntance = component._init(params);
  var data = {
    state: function() {
      component._stateDep.depend();
      return component._state;
    },
    params: params
  };

  var view = Blaze._TemplateWith(data, function() {
    return Spacebars.include(templateIntance);
  });

  view._onViewRendered(component._rendered);
  view.onViewDestroyed(component._destroyed);

  return view;
});