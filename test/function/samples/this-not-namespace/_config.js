const assert = require( 'assert' );

module.exports = {
	description: 'does not treat this.foo as a possible namespace (#1258)',
	exports: exports => {
		assert.equal( typeof exports.Foo, 'function' );
	}
};
