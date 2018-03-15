var replace = require( 'rollup-plugin-replace' );

module.exports = function(commandOptions) {
	return {
		input: 'main.js',
		output: {
			format: 'cjs'
		},
		plugins: [
			replace( { 'COMMAND_OPTIONS': JSON.stringify(commandOptions) } )
		]
	};
};
