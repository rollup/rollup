module.exports = defineTest({
	description: 'supports returning a custom AST from a plugin',
	verifyAst: false,
	options: {
		output: { validate: false },
		plugins: [
			{
				name: 'test',
				load(id) {
					if (id.endsWith('main.js')) {
						return {
							code: `import './dep.js';
<=>custom<=>;
'removed';`,
							ast: {
								type: 'Program',
								start: 0,
								end: 42,
								body: [
									{
										type: 'ImportDeclaration',
										start: 0,
										end: 18,
										specifiers: [],
										source: {
											type: 'Literal',
											start: 7,
											end: 17,
											value: './dep.js',
											raw: "'./dep.js'"
										}
									},
									{ type: 'FancyNode', start: 19, end: 32 },
									{
										type: 'ExpressionStatement',
										start: 33,
										end: 43,
										expression: {
											type: 'Literal',
											start: 33,
											end: 42,
											value: 'removed',
											raw: "'removed'"
										}
									}
								]
							}
						};
					}
				},
				transform(code, id) {
					if (id.endsWith('dep.js')) {
						return {
							code: `<=>other<=>;`,
							ast: {
								type: 'Program',
								start: 0,
								end: 12,
								body: [{ type: 'FancyNode', start: 0, end: 12 }],
								sourceType: 'module'
							}
						};
					}
				}
			}
		]
	}
});
