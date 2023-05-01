const acorn = require('acorn');

const modules = {
	main: "import foo from 'foo';\nfoo();",

	// the code points to './bar' but the AST points to './baz', so we
	// can check the AST is being used
	foo: {
		code: "import bar from 'bar';\nexport default function foo () {\n\tassert.equal(bar, 42);\n}",
		ast: acorn.parse(
			"import bar from 'baz';\nexport default function foo () {\n\tassert.equal(bar, 42);\n}",
			{
				ecmaVersion: 6,
				sourceType: 'module'
			}
		)
	},

	baz: 'export default 42;'
};
modules.foo.ast._ignoredProp = {};

module.exports = defineTest({
	description: 'uses supplied AST',
	options: {
		plugins: [
			{
				resolveId(importee, importer) {
					if (!importer) return 'main';
					return importee;
				},
				load(id) {
					if (id === 'bar') {
						throw new Error('loaded incorrect module');
					}

					return modules[id];
				}
			}
		]
	}
});
