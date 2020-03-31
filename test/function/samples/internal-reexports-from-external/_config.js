const assert = require('assert');
const fs = require('fs');

module.exports = {
	description:
		'fails with a helpful error if creating a namespace object containing a reexported external namespace',
	options: {
		external: ['fs'],
	},
	exports(ns) {
		assert.strictEqual(ns.namespace.readFile, fs.readFile);
	},
};
