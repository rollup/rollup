module.exports = defineTest({
	description: 'correctly exports a default import, even in ES mode (#513)',
	options: {
		external: ['x'],
		output: {
			globals: { x: 'x' },
			interop: 'compat',
			name: 'myBundle'
		}
	}
});
