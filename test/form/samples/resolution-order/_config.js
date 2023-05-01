module.exports = defineTest({
	description: 'does not depend on the resolution order of modules for tree-shaking (#2753)',
	options: {
		plugins: {
			resolveId(id) {
				if (id === './utcWeek') {
					return new Promise(resolve => setTimeout(resolve, 0));
				}
			}
		}
	}
});
