module.exports = defineTest({
	description: 'properly associate or shadow variables in and around functions',
	options: {
		external: ['external-package'],
		output: {
			globals: { 'external-package': 'externalPackage' },
			name: 'iife'
		}
	}
});
