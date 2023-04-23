module.exports = {
	description: 'treeshakes dynamic imports when the target is deterministic',
	options: {
		output: {
			inlineDynamicImports: true
		},
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
						if (match[1] === 'bail')
							return {
								code: [
									`export default '@included-bail-${match[2]}'`,
									`export const named${match[2]} = 'bail${match[2]}';`
								].join('\n')
							};
						else if (match[1] === 'effect') {
							return {
								code: [
									'export function fn() { /* @tree-shaken */ }',
									`console.log('@included-effect-${match[2]}');`
								].join('\n')
							};
						}
					}
					return null;
				}
			}
		]
	},
	async exports({ allExports }) {
		await allExports();
	},
	context: {
		named1: 'named1',
		named4: 'named4'
	}
};
