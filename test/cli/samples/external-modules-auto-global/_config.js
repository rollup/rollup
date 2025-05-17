const assert = require('node:assert');

module.exports = defineTest({
	description: 'populates options.external with --global keys',
	spawnArgs: [
		'main.js',
		'--format',
		'iife',
		'--globals',
		'mathematics:Math,promises:Promise',
		'--external',
		'promises'
	],
	execute: true,
	stderr(stderr) {
		assert.ok(!stderr.includes('(!)'));
	}
});
