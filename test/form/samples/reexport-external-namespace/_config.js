module.exports = defineTest({
	description: 're-exports * from external module (#791)',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
