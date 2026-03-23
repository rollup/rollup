const path = require('node:path');

const ID_ENTRY1 = path.join(__dirname, 'entry1.js');
const ID_ENTRY2 = path.join(__dirname, 'entry2.js');
const ID_INDEX = path.join(__dirname, 'lib/index.js');
const ID_FOO = path.join(__dirname, 'lib/foo.js');
const ID_FOO_IMPL = path.join(__dirname, 'lib/fooImpl.js');

module.exports = defineTest({
	description: 'handles cyclic reexports through cached namespace reexports for multiple importers',
	options: {
		output: {
			preserveModules: true
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_ENTRY1, ID_INDEX, ID_FOO, ID_FOO_IMPL, ID_ENTRY1],
			message:
				'Circular dependency: entry1.js -> lib/index.js -> lib/foo.js -> lib/fooImpl.js -> entry1.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_INDEX, ID_FOO, ID_FOO_IMPL, ID_ENTRY2, ID_INDEX],
			message:
				'Circular dependency: lib/index.js -> lib/foo.js -> lib/fooImpl.js -> entry2.js -> lib/index.js'
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FOO_IMPL,
			id: ID_ENTRY1,
			message:
				'Export "foo" of module "lib/fooImpl.js" was reexported through module "lib/foo.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "entry1.js" to point directly to the exporting module or do not use "output.preserveModules" to ensure these modules end up in the same chunk.',
			reexporter: ID_FOO
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FOO_IMPL,
			id: ID_ENTRY2,
			message:
				'Export "foo" of module "lib/fooImpl.js" was reexported through module "lib/foo.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "entry2.js" to point directly to the exporting module or do not use "output.preserveModules" to ensure these modules end up in the same chunk.',
			reexporter: ID_FOO
		}
	]
});
