const assert = require( 'assert' );

module.exports = {
	description: 'warns on unused imports ([#595])',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`'external' is imported by main.js, but could not be resolved – treating it as an external dependency. For help see https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency`,
			`'unused', 'notused' and 'neverused' are imported from external module 'external' but never used`,
			`Generated an empty bundle`
		]);
	}
};
