const assert = require('assert');

module.exports = {
	description: 'populates options.external with --global keys',
	command:
		'rollup main.js --format iife --globals mathematics:Math,promises:Promise --external promises',
	execute: true,
	stderr(stderr) {
		assert.strictEqual(stderr.indexOf('(!)'), -1);
	}
};
