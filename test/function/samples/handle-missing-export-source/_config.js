module.exports = defineTest({
	description:
		'does not fail if a pre-generated AST is omitting the source property of an unused named export (#3210)',
	verifyAst: false,
	options: {
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('foo.js')) {
						const ast = this.parse(code);
						delete ast.body.find(node => node.type === 'ExportNamedDeclaration').source;
						return { code, ast };
					}
				}
			}
		]
	}
});
