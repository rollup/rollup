module.exports = defineTest({
	description: 'throws if an AST node is of an unknown type',
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
							type: 'Program',
							start: 0,
							end: 2,
							body: [
								{
									type: 'ExpressionStatement',
									start: 0,
									end: 2,
									expression: { type: 'UnknownNode' }
								}
							],
							sourceType: 'module'
						}
					};
				}
			}
		]
	},
	error: {
		code: 'CANNOT_SERIALIZE_AST',
		message:
			'Could not serialize AST: Found unknown node type "UnknownNode" in ExpressionStatement.expression.'
	}
});
