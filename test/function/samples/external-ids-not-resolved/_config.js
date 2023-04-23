module.exports = defineTest({
	description: 'does not attempt to resolve external IDs',
	options: {
		external: ['external'],
		plugins: [
			{
				resolveId(importee) {
					if (importee === 'external') {
						throw new Error('Attempted to resolve external module ID');
					}
				}
			}
		]
	}
});
