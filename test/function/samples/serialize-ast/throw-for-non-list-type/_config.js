module.exports = defineTest({
	description: 'throws if a non-list type is in place of a list',
	verifyAst: false,
	options: {
		plugins: [
			{
				resolveId() {
					return 'main';
				},
				load() {
					return {
						code: 'x;',
						ast: {
							type: 'Program',
							start: 0,
							end: 2,
							body: {
								type: 'ExpressionStatement',
								start: 0,
								end: 2,
								expression: { type: 'Identifier', start: 0, end: 1, name: 'x' }
							},
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
			'Could not serialize AST: Expected Program.body to be an array, but it was {"type":"ExpressionStatement","start":0,"end":2,"expression":{"type":"Identifier","start":0,"end":1,"name":"x"}}.'
	}
});
