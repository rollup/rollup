const assert = require( 'assert' );

module.exports = {
	description: 'warns on top-level this (#770)',
	warnings: warnings => {
		const message = `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`;
		assert.equal(warnings.length, 1);
		assert.equal(warnings[0].indexOf(message), 0);
		assert(warnings[0].match(/\(in.*warn-on-top-level-this.*\)/));
	},
	runtimeError: err => {
		assert.equal( err.message, `Cannot set property 'foo' of undefined` );
	}
};
