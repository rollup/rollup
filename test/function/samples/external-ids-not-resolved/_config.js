module.exports = {
	description: 'does not attempt to resolve external IDs',
	options: {
		external: ['external'],
		plugins: [
			{
				resolveId: function(importee) {
					if (importee === 'external') {
						throw new Error('Attempted to resolve external module ID');
					}
				}
			}
		]
	}
};
