var ComponentId = 0;

Template.render = new Template("Template.render", function() {
  var wrapperView = this;
  var parentComponent = GetComponent(wrapperView);
  var componentName = Spacebars.call(wrapperView.lookup("component"));
  var partialName = Spacebars.call(wrapperView.lookup("partial"));
  var props = Blaze._parentData(0);

  if(partialName) {
    var data = Blaze._parentData(1) || {};
    var view = Blaze._TemplateWith(data, function() {
      return Spacebars.include(Template[partialName]);
    });
    return view;
  }

  if(!componentName) {
    throw new Error("FlowComponent needs 'component' parameter");
  }

  if(!ComponentsStore[componentName]) {
    throw new Error("No such FlowComponent: " + componentName);
  }

  var component =
    new (ComponentsStore[componentName])(props, wrapperView, parentComponent);
  var view = component.getView();

  if(view) {
    setTimeout(function() {
      var id = props.id || "cid-" + (++ComponentId);
      if(parentComponent) {
        parentComponent._children[id] = component;
        view.onViewDestroyed(function() {
          delete parentComponent._children[id];
        });
      }
    }, 0);
  }

  return view;
});