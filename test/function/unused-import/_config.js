const assert = require( 'assert' );

module.exports = {
	description: 'warns on unused imports ([#595])',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`Treating 'external' as external dependency`,
			`'unused', 'notused' and 'neverused' are imported from external module 'external' but never used`,
			`Generated an empty bundle`
		]);
	}
};
