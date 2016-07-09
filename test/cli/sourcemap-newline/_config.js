const assert = require( 'assert' );

module.exports = {
	solo: true,
	description: 'adds a newline after the sourceMappingURL comment (#756)',
	command: 'rollup -i main.js -m inline',
	result: code => {
		assert.equal( code.slice( -1 ), '\n' );
	}
};
