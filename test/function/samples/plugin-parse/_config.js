const MagicString = require('magic-string');

module.exports = {
	description: 'plugin transform hooks can use `this.parse(code, options)`',
	options: {
		plugins: [{
			name: 'test',
			transform (code, id) {
				const magicString = new MagicString(code);
				enforceTheAnswer(this.parse(code), magicString);
				return magicString.toString();
			}
		}]
	}
};

function enforceTheAnswer(ast, magicString) {
	ast.body.forEach(node => {
		if (node.type === 'VariableDeclaration') {
			node.declarations.forEach(decl => {
				if (decl.id.name === 'answer') {
					magicString.overwrite(decl.init.start, decl.init.end, '42');
				}
			});
		}
	});
}
