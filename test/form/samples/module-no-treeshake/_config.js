function getCode(id) {
	return `const unused = 'unused in ${id}';`;
}

module.exports = defineTest({
	description: 'allows disabling tree-shaking for modules',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id.startsWith('dep')) {
						if (id === 'depResolved') {
							return {
								id,
								moduleSideEffects: 'no-treeshake'
							};
						}
						return id;
					}
				},
				load(id) {
					if (id.startsWith('dep')) {
						if (id === 'depLoaded') {
							return {
								code: getCode(id),
								moduleSideEffects: 'no-treeshake'
							};
						}
						return getCode(id);
					}
				},
				transform(code, id) {
					if (id === 'depTransformed') {
						return {
							code: getCode(id),
							moduleSideEffects: 'no-treeshake'
						};
					}
				}
			}
		]
	}
});
