module.exports = defineTest({
	description: 're-exports a named export from an external module',
	options: {
		external: ['external1', 'external2'],
		output: {
			globals: { external1: 'external1', external2: 'external2' },
			name: 'bundle'
		}
	}
});
