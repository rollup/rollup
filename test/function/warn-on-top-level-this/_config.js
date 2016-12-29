const assert = require( 'assert' );

module.exports = {
	description: 'warns on top-level this (#770)',
	warnings: [
		{
			code: 'THIS_IS_UNDEFINED',
			message: `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten`,
			pos: 81,
			loc: {
				file: require( 'path' ).resolve( __dirname, 'main.js' ),
				line: 3,
				column: 0
			},
			frame: `
				1: const someVariableJustToCheckOnCorrectLineNumber = true; // eslint-disable-line
				2:
				3: this.foo = 'bar';
				   ^
			`,
			url: `https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined`
		}
	],
	runtimeError: err => {
		assert.equal( err.message, `Cannot set property 'foo' of undefined` );
	}
};
