module.exports = defineTest({
	description: 'throws if the top-level AST node is of an unknown type',
	verifyAst: false,
	options: {
		plugins: [
			{
				resolveId() {
					return 'main';
				},
				load() {
					return {
						code: '',
						ast: {
							type: 'Unknown'
						}
					};
				}
			}
		]
	},
	error: {
		code: 'CANNOT_SERIALIZE_AST',
		message: 'Could not serialize AST: Found unknown node type "Unknown" at the root.'
	}
});
