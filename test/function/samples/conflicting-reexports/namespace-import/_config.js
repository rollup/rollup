const path = require('path');

module.exports = {
	description: 'warns when a conflicting binding is imported via a namespace import',
	warnings: [
		{
			code: 'NAMESPACE_CONFLICT',
			message:
				'Conflicting namespaces: "reexport.js" re-exports "foo" from one of the modules "first.js" and "second.js" (will be ignored)',
			name: 'foo',
			reexporter: path.join(__dirname, 'reexport.js'),
			sources: [path.join(__dirname, 'first.js'), path.join(__dirname, 'second.js')]
		},
		{
			code: 'MISSING_EXPORT',
			exporter: 'reexport.js',
			frame: `
2:
3: assert.deepStrictEqual(ns, { __proto__: null, bar: 1, baz: 2 });
4: assert.strictEqual(ns.foo, undefined)
                         ^`,
			id: path.join(__dirname, 'main.js'),
			importer: 'main.js',
			loc: {
				column: 22,
				file: path.join(__dirname, 'main.js'),
				line: 4
			},
			message: "'foo' is not exported by 'reexport.js'",
			missing: 'foo',
			pos: 125,
			url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module'
		}
	]
};
