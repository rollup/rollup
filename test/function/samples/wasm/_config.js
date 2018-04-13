var assert = require('assert');
var path = require('path');

module.exports = {
	description: 'wasm dynamic import',
	skip: typeof WebAssembly === undefined,
	// FIXME(sven): doesn't seem to skip
	options: {
		experimentalDynamicImport: true
	},
	exports: function(exports) {
		exports.res.then(x => console.log(x));
	}
};
