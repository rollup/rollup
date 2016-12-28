const assert = require( 'assert' );

module.exports = {
	description: 'populates file property of sourcemap (#986)',
	command: 'rollup -i main.js -o _actual/bundle.js -m'
};
