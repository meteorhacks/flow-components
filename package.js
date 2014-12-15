Package.describe({
  summary: 'Flow Components',
  version: '0.0.10',
  git: 'https://github.com/meteorhacks/flow-components',
  name: "meteorhacks:flow-components"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use('ui');
  api.use('templating');
  api.use('reactive-var');
  api.use('reactive-dict');
  api.use('underscore');
  api.use('raix:eventemitter@0.0.2');
  
  api.addFiles('lib/client/action_hub.js', 'client');
  api.addFiles('lib/client/component.js', 'client');
  api.addFiles('lib/client/lookup.js', 'client');
  api.addFiles('lib/client/api.js', 'client');
  api.addFiles('lib/client/main.html', 'client');
  api.export(['FlowComponents']);
});
