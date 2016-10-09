const assert = require( 'assert' );

module.exports = {
	solo: true,
	description: 'warns on top-level this (#770)',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`main.js (3:1) The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten. See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined for more information`
		]);
	},
	runtimeError: err => {
		assert.equal( err.message, `Cannot set property 'foo' of undefined` );
	}
};
