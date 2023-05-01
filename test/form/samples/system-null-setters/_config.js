module.exports = defineTest({
	description: 'allows to avoid null setters for side effect only imports',
	options: {
		external: ['external'],
		output: {
			format: 'system',
			systemNullSetters: false
		}
	}
});
