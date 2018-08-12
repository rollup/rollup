module.exports = {
	description: 'external function ignores \\0 started ids',
	options: {
		external(id) {
			if (id.startsWith('\0')) {
				throw Error('\\0 started ids should not be tested as external');
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
					if (id === '\0external') {
						return 'export default 1';
					}
				}
			}
		]
	}
};
