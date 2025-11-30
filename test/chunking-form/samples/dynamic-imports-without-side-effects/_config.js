module.exports = defineTest({
	description: 'Removes dynamic imports without side effects if the exports are not used',
	options: {
		external: ['external', 'external2'],
		treeshake: {
			moduleSideEffects: id => {
				if (id.endsWith('external') || id.endsWith('sub.js')) {
					return false;
				}
				return true;
			}
		}
	},
	formats: ['es', 'system']
});
