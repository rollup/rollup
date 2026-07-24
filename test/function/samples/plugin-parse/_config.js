const MagicString = require('magic-string').default;

module.exports = defineTest({
	description: 'plugin transform hooks can use `this.parse(code, options)`',
	options: {
		plugins: [
			{
				name: 'test',
				transform(code) {
					const magicString = new MagicString(code);
					enforceTheAnswer(this.parse(code), magicString);
					return magicString.toString();
				}
			}
		]
	}
});

function enforceTheAnswer(ast, magicString) {
	for (const node of ast.body) {
		if (node.type === 'VariableDeclaration') {
			for (const declaration of node.declarations) {
				if (declaration.id.name === 'answer') {
					magicString.overwrite(declaration.init.start, declaration.init.end, '42');
				}
			}
		}
	}
}
