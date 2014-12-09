Package.describe({
  summary: 'Echo Components',
  version: '0.0.7',
  git: 'https://github.com/meteorhacks/echo-components',
  name: "meteorhacks:echo-components"
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@0.9.2');
  api.use('ui');
  api.use('templating');
  api.use('reactive-var');
  api.use('reactive-dict');
  api.use('underscore');
  
  api.addFiles('lib/client/component.js', 'client');
  api.addFiles('lib/client/api.js', 'client');
  api.addFiles('lib/client/echo.main.html', 'client');
  api.export(['EchoComponents']);
});
