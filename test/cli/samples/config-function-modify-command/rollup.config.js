import replace from '@rollup/plugin-replace';

export default commandOptions => {
	const COMMAND_OPTIONS = JSON.stringify(commandOptions);
	delete commandOptions['some-option'];
	delete commandOptions['another-option'];
	commandOptions.format = 'cjs';
	return {
		input: 'main.js',
		onwarn(warning) {
			throw new Error(`Unexpected warning: ${warning.message}`);
		},
		plugins: [replace({ COMMAND_OPTIONS })]
	};
};
