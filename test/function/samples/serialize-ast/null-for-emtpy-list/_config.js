const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows null and undefined for empty lists',
	verifyAst: false,
	options: {
		plugins: [
			{
				resolveId() {
					return 'main';
				},
				load() {
					return {
						code: 'export const x = [];',
						ast: {
							type: 'Program',
							start: 0,
							end: 20,
							body: [
								{
									type: 'ExportNamedDeclaration',
									start: 0,
									end: 20,
									declaration: {
										type: 'VariableDeclaration',
										start: 7,
										end: 20,
										declarations: [
											{
												type: 'VariableDeclarator',
												start: 13,
												end: 19,
												id: { type: 'Identifier', start: 13, end: 14, name: 'x' },
												init: {
													type: 'ArrayExpression',
													start: 17,
													end: 19,
													// should actually be an empty list
													elements: null
												}
											}
										],
										kind: 'const'
									},
									// There should actually be an empty list
									// specifiers: [],
									source: null
								}
							],
							sourceType: 'module'
						}
					};
				}
			}
		]
	},
	exports(exports) {
		assert.deepEqual(exports.x, []);
	}
});
