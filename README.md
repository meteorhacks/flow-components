# Flow Components

Build your Meteor app with Components.

Flow Components has taken a lot of concepts from React and apply them on top Blaze. It's not a 1-1 mapping of react since we are using the reactivity in Blaze.

We've also added some handy features which will help you to control reactivity when building a large application.

## TOC

* Why
* Getting Started
* States
* Actions
* Props
* Prototypes
* Extending Components with Mixins
* Extending Components with Nested Components
* Life Cycle Events
* Autoruns
* State Functions
* Block Helpers
* Referencing Child Components
* Organizing Large Components
* Accessing Component DOM
* How Flow Component different from XXX

## Why?

When we were building the kadira.io at first, we've no idea how to architect a Meteor app. After working with almost 1.5 years, we releazied we are doing it wrong. 

So, we think a lot and played with a lot of UI frameworks and concepts. That included react and flux. After a lot of iterations and experiments, Flow Components is our component framework which is a part of the Flow Architecture. 

## Getting Started

Let's create a very simple component. It's a typical Hello World example.

First add Flow Components into your app.

~~~shell
meteor add meteorhacks:flow-components
~~~

Then create directory on the client folder and put these files.

Here's the JavaScript file, (`component.js`) which is the component.

~~~js
var component = FlowComponents.define('hello-component', function(props) {
  console.log("A component created!");
  var self = this;
  this.name = props.name;
  
  this.setGreeting();
  setInterval(this.setGreeting.bind(this), 300);
});

component.prototype.setGreeting = function() {
  var greetings = ["awesome", "nice", "cool", "kind"];
  var randomGreeting = messages[Math.floor(messages.length * Math.random())];
  this.set("greeting", randomGreeting)
};

component.state.message = function() {
  return this.name + ", you are " + this.get("greeting") + "!";
};
~~~

Now we need our template(`view.html`). It's name should be identical to the name of the component which is `hello-component`.

~~~html
<template name="hello-component">
  <div class="hello-component">
    Welcome Message: {{state$message}}
  </div>
</template>
~~~

Then, let's add a CSS file for our component.
~~~css
.hello-component {
  font-family: 'Helvetica Neue', Helvetica, 'Segoe UI', Arial;
  font-size: 16px;
  margin: 10px;
}
~~~

Now we've created our first component. We can render it anywhere we like. Here's how to do it.

~~~html
{{> render component="hello-component" name="Arunoda"}}
{{> render component="hello-component" name="Sacha"}}
~~~

Then, this is how it's looks like:

![Flow Components in Action](https://cldup.com/ma6Tiq9rXO.gif)

Check [this repo](https://github.com/flow-examples/hello-component) for the complete source code.

## States

State is a variable which is reactive. It can hold any JavaScript literal or object. This is very similar to a template helper is blaze, but it's intergrated into the component.

There are couple of ways, you can get a state. This is the first way.

#### Creating states using `component.state.`

~~~
var component = FlowComponents.define('my-component');
component.state.message = function() {
  return "some value";
};
~~~

Above function is running in a reactive context and you can use anykind of reactive variables, Session variables and MiniMongo Apis inside it.

Context of the above function will be the component itself.

#### Creating states using `this.set`

You can also set an state with `this.set` API. This is an api of the component. So, you can use it anywhere withing the component.

#### Accessing states inside a template

You can access the state anywhere in the template as below:

~~~html
<template name='my-component'>
  Message is: {{ state$message }}
</template>
~~~

To access the state, just prefix it with `state$`. You can even access the state inside nested templates in a given component.

#### Accessing states inside a component with `this.get`

You can also access the state inside the component with this `this.get` API like this:

~~~js
component.state.messageWithName = function() {
  var message = this.get("message");
  return "Arunoda, " + message;
};
~~~

`this.get` is reactive and available anywhere inside the component.

## Actions

Components don't handle DOM events directly. For that we need to create an action call that action inside a DOM event handler. This is how do create an action.

~~~js
var component = FlowComponents.define('my-component');
component.action.changeMessage = function(someValue) {
  this.set("message", someValue);
};
~~~

Context of the message is the component itself. You can access reactive content inside that, but the action won't re-run again.

There are few ways to call an action. Let's look at them.

#### Via an DOM event handler

You can call an action inside an event handler. But, that event handler needs to be registered for a template of the given component. This is how to do that.

~~~js
Template['my-component'].events({
  "click button": function() {
    var message = $('.textbox').val();
    FlowComponents.callAction("changeMessage", message);
  }
});
~~~

#### Via Props (aka: Action Passing)

You can also pass an action to a child component via props. Then the child component can call that action just like invoking a JavaScript function. This is how to do it.

Let's say we are rendering another components like this inside our main component:

~~~js
{{> render component="input" onSubmit=action$changeMessage }}
~~~

Then inside the `input` component, it call call the `onSubmit` property like this:

~~~js
var component = FlowComponents.define("input", function(props) {
  this.onSubmit = props.onSubmit;
});

component.action.submitMessage = function(message) {
  this.onSubmit(message);
};
~~~

We also call this method as "action passing". This is the basic building block for creating nested components.

## Props

Props is a way to pass values when rendering the component. A prop can be any valid JavaScript literal, object or a function. This is how to do it:

~~~html
{{> render component="input" text="This is great" }}
~~~

Then you can access it inside the component like this:

~~~
var component = FlowComponents.define("input", function(props) {
  console.log("Text is: ", props.text);
});
~~~

You can set any number of props you like:

~~~html
{{> render component="input" 
      text="This is great"
      backgroundColor="#736634"
      fontSize=20 
}}
~~~

You can pass a state like this:

~~~html
{{> render component="input" text=state$message }}
~~~

We've previously talked about how to pass an action like this:

~~~html
{{> render component="input" onSubmit=action$message }}
~~~

## Prototypes

A Prototype is a very similar to a proptype is javascript. Prototype is a common function (or property) you can access anywhere inside a component. We've used proptypes in the component we wrote in the Getting Started section.

~~~js
var component = FlowComponents.define('hello-component', function(props) {  
  this.setGreeting();
  setInterval(this.setGreeting.bind(this), 300);
});

component.prototype.setGreeting = function() {
  var greetings = ["awesome", "nice", "cool", "kind"];
  var randomGreeting = messages[Math.floor(messages.length * Math.random())];
  this.set("greeting", randomGreeting)
};
~~~

In that, we've created a `setGreeting` prototype and call in when a component is creating.

We've also calling it for every 300 milliseconds via the `setInterval`;

## Extending Components with Mixins

Sometimes we create similar kind of components. Then, we've to copy and paste a lot of code including `prototypes`, `states` and `actions`. It's a bad way to manage it.

That's why Mixins going to help us. With mixins we can group a set of common code and extend it with a existing components. Let's say we need to add component level subscriptions to Flow, this is how to do it :)

~~~js
ComponentSubs = {
  prototype: {},
  action: {},
  state: {}
};

ComponentSubs.created = function() {
  this._subs = [];
};

ComponentSubs.rendered = function() {};

ComponentSubs.destroyed = function() {
  this.stopSubscriptions();
};

ComponentSubs.prototype.subscribe = function() {
  var sub = Meteor.subscribe.apply(null, arguments);
  this._subs.push(sub);
  return sub;
};

ComponentSubs.prototype.ready = function() {
  var ready = true;
  this._subs.forEach(function(sub) {
    ready = sub.ready();
  });

  return ready;
};

ComponentSubs.prototype.stopSubscriptions = function() {
  this._subs.forEach(function(sub) {
    sub.stop();
  });
};

ComponentSubs.state.isReady = function() {
  return this.ready();
};

ComponentSubs.action.stopSubscriptions = function() {
  this.stopSubscriptions();
};
~~~

Now you can add extend your component with the mixin we've created like this:

~~~js
var component = FlowComponents.define("my-component", function() {
  // you can use like to this subscribe
  this.subscribe("mysubscription");
});

// extend your component with Mixins
component.extend(ComponentSubs);

// you can use it in an action like this
component.action.loadMore = function() {
  this.subscribe("mysubscription", {limit: 200});
};
~~~

You can use `isReady` state inside the template like this:

~~~html
<template name="my-component">
  {{#if state$isReady}}
    <!-- do something with your data -->
  {{else}}
    Loading...
  {{/if}}
</template>
~~~

## Extending Components with Nested Components

We can use Mixins to extend the functionalities for the component. But we can't use that to extend the user interface. That's where we can use nested components.

There is no special UI for that, but you can create a component which uses few other components inside that.

You can also accept an component name from the `props` and render that. For an example, let's say we are building a loading component. So, we can allow to customize the loading spinner. Here is is:

~~~js
var component = FlowComponents.define("loading", function(props) {
  this.set("loadingComponent", props.loadingComponent);
});
~~~

This is the UI for that:
~~~html
{{#if state$loadingComponent}} 
  {{> render component=state$loadingComponent }}
{{else}}
  Loading...
{{/if}}
~~~

## Life Cycle Events

A Component has few different events. Here they are:

* created - after the component instant created
* rendered - after the component rendered to the screen
* destroyed - after the component destroyed

You may need to use these events to customize your components. We need to use the created event almost everytime. So, that's the callback you passed as the second argument when creating the components.

~~~js
var component = FlowComponents.create("hello", function(props) {
  console.log("Component created with props:", props);
});
~~~

In the `created` event callback you can get the `props` as the first argument.

For other two events, they can be access anywhere inside the component like with:

* rendered - `this.onRendered(function() {})`
* destroyed - `this.onDestroyed(function() {})`

~~~js
var component = FlowComponents.create("hello", function() {
  this.onRendered(function() {
    console.log("Rendered to the screen.");
  });

  this.onDestroyed(function() {
    console.log("Component destroyed.");
  });
});
~~~

Context of the callback you've passed to the component is the component itself. So, because of that something like this is possible.

~~~js
var component = FlowComponents.create("hello", function() {
  this.onRendered(function() {
    console.log("Rendered to the screen.");

    this.onDestroyed(function() {
      console.log("Component destroyed.");
    });
  });
});
~~~

## Autoruns

Sometimes we may need to use autoruns inside a component. So, when you start an autorun it needs to stop when the component destroyed. We've a simple way to do that. See:

~~~js
var component = FlowComponents.create("hello", function() {
  this.autorun(function() {
    var posts = Posts.fetch();
    this.set("postCount", posts.length);
  });
});
~~~

> Note: Context of the callback for `this.autorun` is also the component. That's why calling `this.set` is possible inside the autorun

## State Functions

State functions are powerful tools which helps you build components while minimizing re-renders. Before we start, let's see why need it. Look at this nested components:

~~~js
var component = FlowComponents.create("parent", function() {
  var self = this;
  setInterval(function() {
    var usage = Math.ceil(Math.random() * 100);
    this.set("cpuUsage", usage);
  }, 100);
});
~~~

This is the template of parent:

~~~html
<template name="parent">
  {{> render component="gauge" value=state$cpuUsage }}
</template>
~~~

As you can see this is pretty straight forward. Parent component send the CPU usage for every 100 millis and then `guage` component will print it. So, what's the issue here?

Since we get the state as `state$cpuUsage`, it's getting change every 100 millis. So, the `gauge` component will get changed at that time too. Which is very expensive and we don't need to do something like this. That's where state functions are going to help you. Before that, let's look at our gauge component.

~~~js
var component = FlowComponents.create("guage", function(props) {
  this.set('value', props.value);
});
~~~

This is the template:
~~~html
<template name="guage">
  Value is: {{ state$value }}
</template>
~~~

#### Convert to use State Functions

Let's change the parent template like this:

~~~html
<template name="parent">
  {{> render component="gauge" value=stateFn$cpuUsage }}
</template>
~~~

Note that, we only change `state$cpuUsage` into `stateFn$cpuUsage`. With that, we wrap the `cpuUsage` state into a function. So, when it's get changed, it won't re-render the component.

This is how to use it inside the `gauge` component.

~~~js
var component = FlowComponents.create("guage", function(props) {
  this.autorun(function() {
    var value = props.value();
    this.set("value", value);
  });
});
~~~

As you can see, now `value` prop is a function. Now it's only reactive within the autorun we've defined. So, now we can actually, control the reactivity as we need. 

So, writing `this.autorun` for every prop seems like bording task. So, we've a simple way to do it like below:

~~~js
var component = FlowComponents.create("guage", function(props) {
  this.setFn("value", props.value);
});
~~~

## Block Helpers

We can use block helpers to write nested components. Here's an example for a loading component.

~~~html
{{#render component="loading" loaded=stateFn$loaded }}
  {{>render component="data-viewer"}}
{{else}}
  Loading...
{{/render}}
~~~

This is how we can implement the `loading` component

~~~js
var component = FlowComponents.define('loading', function(props) {
  this.setFn("loaded", props.loaded);
});
~~~

Here's the template:
~~~html
<template name="loading">
  {{#if state$loaded}}
    {{ flowContentBlock }}
  {{else}}
    {{ flowElseBlock }}
  {{/if}}
</template>
~~~

## Referencing Child Components

> This API is experimental

So, now we know how to use child components and we've seen some examples. Most of the time you can interact them by passing actions and passing state functions. 

But sometimes, you may need to refer them individually access their states. Let's look at our myForm component.

~~~js
var component = FlowComponents.define("myForm", function() {

}); 

component.action.updateServer = function(name, address) {
  Meteor.call("update-profile", name, address);
};
~~~

This is the template for myForm.

~~~html
<template name="myFrom">
  {{> render component="input" id="name" }}
  {{> render component="input" id="address" }}
  <button>Submit</button>
</template>
~~~

Here's the event handler for submit.

~~~js
Template['myForm'].events({
  "click button": function() {
    var name = FlowComponents.child("name").getState("value");
    var address = FlowComponents.child("value").getState("value");

    FlowComponents.callAction('updateServer', name, address);
  }
});
~~~

See, we could access invidual child component by their id and get the state called value. But this API has following characteristics:

* You can only access child components inside template helper or an event handeler only.
* You can't access it inside the component. (We add this restriction to avoid unnecessory re-renders)
* Unlike id in CSS, here id is scope to a component. You can have the child components with the same id in few different components.
* You can nest child lookups but we highly discourage that.

## Organizing Large Components

Sometimes we may be have components with a large number of states, actions and prototypes. So, it's that case, it's super hard to put them all in a single file. There's a way to put those in different files. This is how to do it.

First create the component and name it like `component.js`

~~~js
var component = FlowComponents.define("myForm", function() {

}); 
~~~

Then create a file for `states` with the name `component_states.js`.

~~~js
var component = FlowComponents.find("myForm"); 
component.state.title = function() {

};
~~~

It's very important to define the component before accessing it using `.find()`. That's why we've a naming convension like above.

Likewise you can group `actions`, `states` and `prototypes` in anyway you like organise your component.

## Accessing Component DOM

We've designed components in a way that to reduce the direct interfacing with the DOM. But in practise, it's hard to do. So, if you want to access the DOM directly inside the component, here are the APIs for that. All these API are scoped to the template of the component.

* this.$(selector) - get a jquery object for the given selector
* this.find(selector) - get a one matching element for the given selector
* this.findAll(selector) - get all matching elements to the given selector

## How Flow Components different from XXX

Let's compare flow with some other components and UI related frameworks

#### Blaze

Flow Component does not replace or Blaze. Intead it's build on top of the Blaze. We are using Blaze templates to render the User Interfaces. When using Flow Components, you might not using template helpers anymore. But still, we are using the core of Blaze.

#### React

React is a completely different UI framework. There is no support for React with flow. But, if there is someway to render React component in Blaze, so, it's possible to use them with flow too. That's because we've build on top the blaze.

#### Polymer / WebComponents

Answer for this is just the same as for React.

#### Ionic / Meteoric

Answer for this is just the same as for React.

#### Angular

It might be possible to use Angular with Flow Components. But havn't try that yet.

#### Blaze 2

There is [proposal](https://meteor.hackpad.com/Proposal-for-Blaze-2-bRAxvfDzCVv) for Blaze 2. It has a it's own component system. It's still in the design phase. We designed Flow Components for our internal use at MeteorHacks. We've build few projects with Flow and it's unlikly we'll switch to a new component system unless it has all of our features. Which is unlikely to happen anyway :D
