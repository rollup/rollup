module.exports = defineTest({
	description: 'allows using empty string as a valid module name',
	options: {
		external: () => false,
		plugins: [
			{
				resolveId(importee, importer) {
					if (importee === '') {
						return importer + '#.js';
					}
				}
			}
		]
	}
});
