module.exports = {
	description: 'treeshakes dynamic imports when the target is deterministic',
	options: {
		output: {
			inlineDynamicImports: true
		},
		external: ['external'],
		plugins: [
			{
				resolveId(id) {
					if (/(bail|effect)-(\d+).js$/.test(id)) {
						return id;
					}
					return null;
				},
				load(id) {
					const match = /(bail|effect)-(\d+).js$/.exec(id);
					if (match) {
						const [, name, index] = match;
						if (name === 'bail')
							return {
								code: [
									`export default '@included-bail-${index}'`,
									`export const named${index} = 'bail${index}';`
								].join('\n')
							};
						else if (name === 'effect') {
							return {
								code: [
									`export function fn${index}() { /* @tree-shaken */ }`,
									`console.log('@included-effect-${index}');`
								].join('\n')
							};
						}
					}
					return null;
				}
			}
		]
	}
};
