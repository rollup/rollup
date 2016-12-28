const assert = require( 'assert' );

module.exports = {
	description: 'wraps a function expression callee in parens to avoid it being parsed as function declaration (#1011)',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			'foo.js (1:15) Ambiguous default export (is a call expression, but looks like a function declaration). See https://github.com/rollup/rollup/wiki/Troubleshooting#ambiguous-default-export'
		]);
	}
};
