## Flow Components

Flow Components is a new way of building Meteor apps. It's a part of flow project and Flow Components is used to build the UI.

## Concept

These are our basic goals.

* Now you need to think your app as a set of components instead of templates
* We can think of an app as a set of UI components. 
* We can organize these components in different ways. 
* We call those as layout

Even though we are using something called components, still it's an addition to Meteor's UI framework Blaze. You still Blaze and it's template to build these components.

## Your First Component

Creating a component is easy. You only need a template. 
Here's a basic component.

~~~html
<template name="hello-component">
  Hello <b>{{params.name}}</b>
  <br/>
</template>
~~~

Now define the component with:

~~~js
FlowComponents.define("hello-component");
~~~

Now you've created a component called `hello-component`. By default it uses the `hello-component` template as it's base template. If you need, you can specify different one as below:

~~~js
FlowComponents.define("hello-component", {
  template: "some-other-template"
});
~~~

Now it's time to render our component. Apply following code:

~~~html
{{>render component="hello-component" name="MeteorHacks"}}
{{>render component="hello-component" name="Echo Components"}}
~~~

Then you can see something like below on the screen.

![Flow Components](https://cldup.com/T47OBCvz5M.png)

I hope you have notice `{{params.name}}` in our template.

That's how you can pass paramters to an components. You can see how we've passed into the component when rendering. 

There are many things you can do with components, now let's look at a very important concept of Flow Components.

## Managing App State

This is one of the main concept of Flow Components. You should not intereact with application state via template helpers. That means, you should not write template helpers like below:

~~~
Template['hello-components'].helpers({
  getUser: function() {
    return Meteor.user();
  }
});
~~~

But you can write helpers like this:

~~~
Template['hello-components'].helpers({
  formatTime: function() {
    return this.time.toUTCString();
  }
});
~~~

What? Then where should I put them ?

**That's the job of the Component**.

Component maintains the application state and it set the state. Then, components template can access them. Let's see how it can be done.

Let's chnage our base template a bit:

~~~html
<template name="hello-component">
  Hello <b>{{params.name}}</b> - {{state.welcome}}
  <br/>
</template>
~~~

See, our template is looking for an state called welcome. Let's set it. For that we need to change our component definition:

~~~js
FlowComponents.define("hello-component", {
  created: function(params) {
    // this autorun computation gets cleaned when component 
    // getting destroyed
    this.autorun(function() {
      var welcomeMessage = Session.get('welcome');
      this.setState({welcome: welcomeMessage});
    });
  }
});
~~~

Then you can set change the welcome message like below:

![Working with states](https://cldup.com/3nNe8bfS3U.gif)

Just like setting states like this, you can set cursors and other reactive variables as well. See how we can set a cursor.

~~~js
FlowComponents.define("hello-component", {
  created: function(params) {
    // this autorun computation gets cleaned when component 
    // getting destroyed
    this.autorun(function() {
      var category = Session.get('category');
      this.setState({
        data: Posts.find({category: category})
      });
    });
  }
});
~~~

## Handling Events

Okay, now we know how to manage state. It's kind a different, but seems like a good idea.
So, how do we handle events.

**You should not handle events in the template helpers**

Again, really? Then how should I do it. That's the job of actions. Let's look at it.

### What is an action

Action is a simple message with some data. Usually, hour template helpers create actions and trigger them. Then any of our component can listen to those actions and act accordingly.

Hmm. Interesting! How should we do it.