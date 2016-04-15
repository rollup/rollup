var assert = require( 'assert' );
var generateTestVal = false;

var ongenerateValue = 'b';


module.exports = {
	description: 'plugins can hook ongenerate',
	options: {
		plugins: [
			{
				ongenerate: function () {
					generateTestVal = ongenerateValue;
				}
			}
		]
	},
	exports: function () {
		assert.equal( generateTestVal, ongenerateValue );
	}
};
