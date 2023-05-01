const path = require('node:path');
const ID_REEXPORT = path.join(__dirname, 'reexport.js');

module.exports = defineTest({
	description:
		'warns when a conflicting binding is imported via a named import from external namespaces',
	warnings: [
		{
			binding: 'foo',
			code: 'AMBIGUOUS_EXTERNAL_NAMESPACES',
			ids: ['first', 'second'],
			message:
				'Ambiguous external namespace resolution: "reexport.js" re-exports "foo" from one of the external modules "first" and "second", guessing "first".',
			reexporter: ID_REEXPORT
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			exporter: 'second',
			ids: [ID_REEXPORT],
			message: '"foo" is imported from external module "second" but never used in "reexport.js".',
			names: ['foo']
		}
	],
	options: { external: ['first', 'second'] },
	context: {
		require(id) {
			return { foo: id };
		}
	}
});
