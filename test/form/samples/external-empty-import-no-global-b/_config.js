module.exports = defineTest({
	description: 'does not expect a global to be provided for empty imports (#1217)',
	options: {
		external: ['babel-polyfill', 'other'],
		onwarn(warning) {
			throw new Error(warning.message);
		},
		output: {
			name: 'myBundle',
			globals: { other: 'other' }
		}
	}
});
