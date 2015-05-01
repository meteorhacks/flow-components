Package.describe({
  summary: 'Flow Components',
  version: '0.0.38',
  git: 'https://github.com/meteorhacks/flow-components',
  name: "meteorhacks:flow-components"
});

Package.onUse(function (api) {
  api.versionsFrom('1.0');
  api.use('blaze');
  api.use('templating');
  api.use('underscore');
  api.use('raix:eventemitter@0.1.1');

  api.addFiles('lib/client/utils.js', 'client');
  api.addFiles('lib/client/state_map.js', 'client');
  api.addFiles('lib/client/action_hub.js', 'client');
  api.addFiles('lib/client/component.js', 'client');
  api.addFiles('lib/client/component_instance.js', 'client');
  api.addFiles('lib/client/api.js', 'client');
  api.addFiles('lib/client/lookup.js', 'client');
  api.addFiles('lib/client/render.js', 'client');
  api.export(['FlowComponents']);
});
