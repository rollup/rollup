const assert = require( 'assert' );
const path = require( 'path' );

module.exports = {
	description: 'warns on export {}, but does not fail',
	warnings: warnings => {
		assert.deepEqual( warnings, [
			`Module ${path.resolve( __dirname, 'main.js' )} has an empty export declaration`,
			'Generated an empty bundle'
		]);
	}
};
