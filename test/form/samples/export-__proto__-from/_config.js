module.exports = defineTest({
	description: 'export __proto__ from',
	options: {
		external: ['x'],
		output: {
			externalLiveBindings: false,
			globals: {
				x: 'x'
			},
			name: 'bundle'
		}
	}
});
