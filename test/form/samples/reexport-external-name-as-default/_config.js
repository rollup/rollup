module.exports = defineRollupTest({
	description: 're-exports a named external export as default',
	options: {
		external: ['external'],
		output: {
			globals: { external: 'external' },
			name: 'bundle'
		}
	}
});
