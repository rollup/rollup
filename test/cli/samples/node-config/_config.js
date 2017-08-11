const glob = require('glob');

console.error(
	`contents of ${__dirname}`,
	glob.sync('**', {cwd: __dirname})
);

module.exports = {
	description: 'uses config file installed from npm',
	command: 'rollup --config node:foo',
	cwd: __dirname,
	execute: true
};
