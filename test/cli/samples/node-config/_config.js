const sander = require('sander');

sander.rimrafSync(__dirname, 'node_modules');
sander.copydirSync(__dirname, 'node_modules_rename_me').to(__dirname, 'node_modules');

module.exports = {
	description: 'uses config file installed from npm',
	command: 'rollup --config node:foo',
	execute: true
};
