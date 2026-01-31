const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows undefined for optional values',
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
												init: { type: 'Literal', start: 17, end: 19, value: 42, raw: '42' }
											}
										],
										kind: 'const'
									},
									specifiers: []
									// This is the optional property set to undefined
									// source: null
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
