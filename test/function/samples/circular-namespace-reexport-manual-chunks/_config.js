const path = require('node:path');

const ID_INDEX = path.join(__dirname, 'index.js');
const ID_TYPES = path.join(__dirname, 'types.js');
const ID_FORMATTERS = path.join(__dirname, 'formatters.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description:
		'correctly handles namespace reexports with circular dependencies when using manual chunks',
	options: {
		output: {
			manualChunks(id) {
				return path.basename(id);
			}
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_INDEX, ID_TYPES, ID_INDEX],
			message: 'Circular dependency: index.js -> types.js -> index.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_INDEX, ID_FORMATTERS, ID_INDEX],
			message: 'Circular dependency: index.js -> formatters.js -> index.js'
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_TYPES,
			id: ID_FORMATTERS,
			message:
				'Export "LANGUAGES" of module "types.js" was reexported through module "index.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "formatters.js" to point directly to the exporting module or reconfigure "output.manualChunks" to ensure these modules end up in the same chunk.',
			reexporter: ID_INDEX
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FORMATTERS,
			id: ID_MAIN,
			message:
				'Export "*" of module "formatters.js" was reexported through module "index.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "main.js" to point directly to the exporting module or reconfigure "output.manualChunks" to ensure these modules end up in the same chunk.',
			reexporter: ID_INDEX
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FORMATTERS,
			id: ID_MAIN,
			message:
				'Export "*" of module "formatters.js" was reexported through module "index.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "main.js" to point directly to the exporting module or reconfigure "output.manualChunks" to ensure these modules end up in the same chunk.',
			reexporter: ID_INDEX
		},
		{
			code: 'CYCLIC_CROSS_CHUNK_REEXPORT',
			exporter: ID_FORMATTERS,
			id: ID_TYPES,
			message:
				'Export "*" of module "formatters.js" was reexported through module "index.js" while both modules are dependencies of each other and will end up in different chunks by current Rollup settings. This scenario is not well supported at the moment as it will produce a circular dependency between chunks and will likely lead to broken execution order.\nEither change the import in "types.js" to point directly to the exporting module or reconfigure "output.manualChunks" to ensure these modules end up in the same chunk.',
			reexporter: ID_INDEX
		},
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "index.js".',
			names: ['index.js']
		}
	]
});
