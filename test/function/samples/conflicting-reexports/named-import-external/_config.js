const path = require('path');
const REEXPORT_ID = path.join(__dirname, 'reexport.js');

module.exports = {
	description:
		'warns when a conflicting binding is imported via a named import from external namespaces',
	warnings: [
		{
			code: 'AMBIGUOUS_EXTERNAL_NAMESPACES',
			message:
				'Ambiguous external namespace resolution: "reexport.js" re-exports "foo" from one of the external modules "first" and "second", guessing "first".',
			name: 'foo',
			reexporter: REEXPORT_ID,
			sources: ['first', 'second']
		},
		{
			code: 'UNUSED_EXTERNAL_IMPORT',
			message: '"foo" is imported from external module "second" but never used in "reexport.js".',
			names: ['foo'],
			source: 'second',
			sources: [REEXPORT_ID]
		}
	],
	options: { external: ['first', 'second'] },
	context: {
		require(id) {
			return { foo: id };
		}
	}
};
