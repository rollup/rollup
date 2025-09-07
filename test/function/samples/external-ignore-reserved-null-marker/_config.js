module.exports = defineTest({
	description: 'external function ignores \\0 started ids',
	options: {
		external(id) {
			if (id[0] === '\0') {
				throw new Error('\\0 started ids should not be tested as external');
			}
			return true;
		},
		plugins: [
			{
				resolveId(importee) {
					if (importee === '\0external') {
						return importee;
					}
				},
				load(id) {
					if (id.slice(-7) === 'main.js') {
						return 'import external from "\0external";assert.equal(external, 1);';
					}
					if (id === '\0external') {
						return 'export default 1';
					}
					throw new Error('Unexpected id to be loaded: ' + id);
				}
			}
		]
	}
});
