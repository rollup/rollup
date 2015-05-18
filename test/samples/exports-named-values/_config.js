module.exports = {
	description: 'exports named values from the bundle entry module',
	exports: function ( exports, assert ) {
		assert.equal( exports.answer, 42 );
	}
};