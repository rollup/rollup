module.exports = defineTest({
	description: 're-exports a named external export as default via another file',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
