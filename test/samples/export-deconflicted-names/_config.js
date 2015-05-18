module.exports = {
	description: 'correctly exports deconflicted names',
	exports: function ( exports, assert ) {
		assert.equal( exports.bar(), 'bar' );
	}
};