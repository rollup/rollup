const assert = require( 'assert' );

module.exports = {
	description: 'uses original name of default export function (#1011)',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			'foo.js (1:15) Ambiguous default export (is a call expression, but looks like a function declaration). See https://github.com/rollup/rollup/wiki/Troubleshooting#ambiguous-default-export'
		]);
	}
};
