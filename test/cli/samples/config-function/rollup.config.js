import assert from 'assert';
import replace from 'rollup-plugin-replace';

export default commandOptions => {
	assert.equal(commandOptions.silent, true);
	return {
		input: 'main.js',
		output: {
			format: 'cjs'
		},
		onwarn(warning) {
			throw new Error(`Unexpected warning: ${warning.message}`);
		},
		plugins: [
			replace( { 'COMMAND_OPTIONS': JSON.stringify(commandOptions) } )
		]
	};
};
