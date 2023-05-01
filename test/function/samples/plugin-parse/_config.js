const MagicString = require('magic-string');

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
			for (const decl of node.declarations) {
				if (decl.id.name === 'answer') {
					magicString.overwrite(decl.init.start, decl.init.end, '42');
				}
			}
		}
	}
}
