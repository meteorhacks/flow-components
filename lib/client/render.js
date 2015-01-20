Template.render = new Template("Template.render", function() {
  var wrapperView = this;
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

  var component = new (ComponentsStore[componentName])(props, wrapperView);
  var view = component.getView();

  setTimeout(function() {
    if(props.id && view) {
      var parentComponent = GetComponent(Blaze._getParentView(view));
      if(parentComponent) {
        parentComponent._children[props.id] = component;
        view.onViewDestroyed(function() {
          delete parentComponent._children[props.id];
        });
      }
    }
  }, 0);

  return view;
});