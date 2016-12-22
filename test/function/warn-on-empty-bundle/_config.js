const assert = require( 'assert' );

module.exports = {
	description: 'warns if empty bundle is generated  (#444)',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			'Generated an empty bundle'
		]);
	}
};
