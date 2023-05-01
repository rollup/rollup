module.exports = defineTest({
	description: 'reexports an external default export',
	options: {
		external: ['external1', 'external2'],
		output: {
			globals: { external1: 'external1', external2: 'external2' },
			name: 'bundle'
		}
	}
});
