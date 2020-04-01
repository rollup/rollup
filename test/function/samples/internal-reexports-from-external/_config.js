const assert = require('assert');
const fs = require('fs');

module.exports = {
	description: 'supports namespaces with external star reexports',
	options: {
		external: ['fs'],
	},
	exports(ns) {
		assert.strictEqual(ns.namespace.readFile, fs.readFile);
	},
};
