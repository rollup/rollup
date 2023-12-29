module.exports = defineTest({
	description: 'export string name',
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
