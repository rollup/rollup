module.exports = defineTest({
	description:
		'correctly tracks side-effect dependencies for multiple importers through namespace reexport cache',
	options: {
		input: ['entry1.js', 'entry2.js'],
		treeshake: {
			moduleSideEffects(id) {
				if (id.endsWith('index.js')) return false;
				return true;
			}
		}
	}
});
