# Flow Components

Build your Meteor app with Components.

Flow Components has taken a lot of concepts from React and apply them on top Blaze. It's not a 1-1 mapping of react since we are using the reactivity in Blaze.

We've also added some handy features which will help you to control reactivity when building a large application.

## TOC

* Why
* Getting Started
* States
* Actions
* Prototypes
* Properities
* Component Instance
* Extending Components with Mixins
* State Functions
* Action Passing
* Block Helpers
* Reusable Components
* Nested Components and Children
* JavaScript API
* Organizing Large Components (with .find())
* Accessing Component DOM

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
  var self = this;
  this.name = props.name;
  
  this.setGreeting();
  // 
  setInterval(this.setGreeting.bind(this), 1000 * 2);
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