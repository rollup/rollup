const assert = require( 'assert' );

module.exports = {
	description: 'adds a newline after the sourceMappingURL comment (#756)',
	command: 'rollup -i main.js -f es -m inline',
	result: code => {
		assert.equal( code.slice( -1 ), '\n' );
	}
};
