module.exports = defineTest({
	description: 're-exports a named external export as default',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
