const assert = require( 'assert' );

module.exports = {
	description: 're-exports name from external module',
	options: {
		external: [ 'external' ],
		moduleName: 'myBundle'
	}
};
