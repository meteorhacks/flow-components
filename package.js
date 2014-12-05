Package.describe({
  summary: 'Lean Components',
  version: '1.0.0',
  git: 'https://github.com/meteorhacks/lean-components'
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use('ui');
  api.use('templating');
  api.use('reactive-var');
  api.use('reactive-dict');
  
  api.addFiles('lib/client/component.js', 'client');
  api.addFiles('lib/client/api.js', 'client');
  api.export(['LeanComponents']);
});