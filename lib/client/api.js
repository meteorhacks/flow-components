FlowComponents = {};
var ComponentsStore = {};

// Component definition api
FlowComponents.define = function(name, createdCallback) {
  var stateDefs = {};
  var actionDefs = {};

  var ComponentInstanceClass = NewClass(ComponentInstance);
  ComponentsStore[name] = NewClass(Component);

  _.extend(ComponentsStore[name].prototype, {
    name: name,
    created: createdCallback,
    stateDefs: stateDefs,
    actionDefs: actionDefs,
    componentInstanceClass: ComponentInstanceClass
  });

  return {
    state: stateDefs,
    action: actionDefs,
    prototype: ComponentInstanceClass.prototype
  }
};

FlowComponents.find = function(name) {
  var component = ComponentsStore[name];
  if(!component) {
    throw new Error("can't find a component: ", name);
  }

  return {
    state: component.prototype.stateDefs,
    action: component.prototype.actionDefs,
    prototype: component.prototype.componentInstanceClass.prototype
  }
};

FlowComponents.get = function() {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      return component._get.apply(component, arguments);
    }
  }
};

FlowComponents.getProps = function(childId) {
  var currentView = Blaze.currentView;
  if(currentView) {
    var component = GetComponent(currentView);
    if(component) {
      if(childId) {
        return component._propsOfChildren[childId];
      } else {
        return component._props;
      }
    }
  }
};

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

  var component = new (ComponentsStore[componentName]);
  component._props = props;
  var templateIntance = component._getTemplate();

  var view = Blaze._TemplateWith({}, function() {
    return Spacebars.include(templateIntance);
  });

  setTimeout(function() {
    if(props.id && view) {
      debugger;
      var parentComponent = GetComponent(Blaze._getParentView(view));
      if(parentComponent) {
        parentComponent._propsOfChildren[props.id] = props;
        view.onViewDestroyed(function() {
          delete parentComponent._propsOfChildren[props.id];
        }); 
      }
    }
  }, 0);

  view.onViewCreated(function() {
    component._init(props, view);
  });
  view._onViewRendered(component._rendered);
  view.onViewDestroyed(component._destroyed);
  view._component = component;

  return view;
});

var currentLayoutName = null;
var currentLayout = null;
var currentRegions = new ReactiveDict;

FlowComponents.renderLayout = function(layout, regions) {
  Meteor.startup(function() {
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
  });
};

FlowComponents.emitAction = function(event) {
  var regexp = /^\$/;
  if(regexp.test(event)) {
    var privateEvent = event.replace(regexp, "");
    var currentView = Blaze.currentView;

    if(!currentView) {
      throw new Error(event + " needs be emit within view");
    }

    var component = GetComponent(currentView);
    if(!component) {
      throw new Error("there is no component for :" + event);
    }
    
    var args = _.toArray(arguments).slice(1);
    component.emitPrivateAction(privateEvent, args);
  } else {
    ActionHub.emit.apply(ActionHub, arguments);
  }
};