module.exports = defineTest({
	description: 'renders imports and exports with names that start with "*"',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
