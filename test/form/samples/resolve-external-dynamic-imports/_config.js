module.exports = defineTest({
	description: 'does not resolve external dynamic imports via plugins (#2481)',
	options: {
		output: {
			globals: { external: 'myExternal' },
			name: 'bundle'
		},
		external(id) {
			return id.endsWith('external');
		},
		plugins: [
			{
				resolveId(id) {
					if (id === 'external') {
						return '/absolute/path/to/external';
					}
				}
			}
		]
	}
});
