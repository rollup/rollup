const assert = require( 'assert' );

module.exports = {
	description: 'export from does not cause erroneous warning if multiple modules export default',
	warnings: [],
	exports: exports => {
		assert.deepEqual( exports, {
			foo: 'foo',
			bar: 'bar'
		});
	}
};