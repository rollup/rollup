const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FIRST = path.join(__dirname, 'first.js');
const ID_SECOND = path.join(__dirname, 'second.js');
const ID_REEXPORT = path.join(__dirname, 'reexport.js');

module.exports = defineTest({
	description: 'warns when a conflicting binding is imported via a namespace import',
	warnings: [
		{
			binding: 'foo',
			code: 'NAMESPACE_CONFLICT',
			ids: [ID_FIRST, ID_SECOND],
			message:
				'Conflicting namespaces: "reexport.js" re-exports "foo" from one of the modules "first.js" and "second.js" (will be ignored).',
			reexporter: ID_REEXPORT
		},
		{
			binding: 'foo',
			code: 'MISSING_EXPORT',
			exporter: ID_REEXPORT,
			id: ID_MAIN,
			message: '"foo" is not exported by "reexport.js", imported by "main.js".',
			url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
			pos: 125,
			loc: {
				column: 22,
				file: ID_MAIN,
				line: 4
			},
			frame: `
				2:
				3: assert.deepStrictEqual(ns, { __proto__: null, bar: 1, baz: 2 });
				4: assert.strictEqual(ns.foo, undefined)
				                         ^`
		}
	]
});
