module.exports = defineTest({
	description: 'properly associate or shadow variables in and around functions',
	options: {
		external: ['external1', 'external2'],
		output: {
			globals: { external1: 'external1', external2: 'external2' },
			name: 'iife'
		}
	}
});
