Template.render = new Template("Template.render", function() {
  var view = this;
  var componentName = Spacebars.call(view.lookup("component"));
  var props = Blaze._parentData(0);


  if(!componentName) {
    throw new Error("FlowComponent needs 'component' parameter");
  }

  if(!ComponentsStore[componentName]) {
    throw new Error("No such FlowComponent: " + componentName);
  }

  var component = new (ComponentsStore[componentName])(props);
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