module.exports = {
	description: 'treeshakes dynamic imports when the target is deterministic',
	options: {
		output: {
			inlineDynamicImports: true
		},
		plugins: [
			{
				resolveId(id) {
					if (/bail-(\d+).js$/.test(id)) {
						return id;
					}
					return null;
				},
				load(id) {
					const match = /bail-(\d+).js$/.exec(id);
					if (match) {
						return {
							code: [
								`export default 'should be included ${match[1]}'`,
								`export const named${match[1]} = 'bail${match[1]}';`
							].join('\n')
						};
					}
					return null;
				}
			}
		]
	}
};
