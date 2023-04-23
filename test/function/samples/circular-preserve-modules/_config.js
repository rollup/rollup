const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FIRST = path.join(__dirname, 'first.js');
const ID_SECOND = path.join(__dirname, 'second.js');

module.exports = defineTest({
	description: 'correctly handles circular dependencies when preserving modules',
	options: {
		output: { preserveModules: true }
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_FIRST, ID_MAIN],
			message: 'Circular dependency: main.js -> first.js -> main.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_SECOND, ID_MAIN],
			message: 'Circular dependency: main.js -> second.js -> main.js'
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_SECOND,
			id: ID_FIRST,
			message:
				'Export "second" of module "second.js" was reexported through module "main.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "first.js" to point directly to the exporting module or do not use "output.preserveModules" to ensure these modules end up in the same chunk.',
			reexporter: ID_MAIN
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FIRST,
			id: ID_SECOND,
			message:
				'Export "first" of module "first.js" was reexported through module "main.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "second.js" to point directly to the exporting module or do not use "output.preserveModules" to ensure these modules end up in the same chunk.',
			reexporter: ID_MAIN
		}
	]
});
