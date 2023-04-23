const assert = require('node:assert');
const path = require('node:path');
const ID_FIRST = path.join(__dirname, 'first.js');
const ID_SECOND = path.join(__dirname, 'second.js');
const ID_THIRD = path.join(__dirname, 'third.js');
const DYNAMIC_IMPORT_PROXY_PREFIX = '\0dynamic-import:';
const chunks = [];

module.exports = defineTest({
	description: 'allows to wait for dependency resolution in this.load to scan dependency trees',
	context: { chunks },
	async exports(exports) {
		assert.deepStrictEqual(chunks, []);
		const { importSecond } = await exports.importFirst();
		const expectedFirstChunk = [ID_FIRST, ID_SECOND, ID_THIRD];
		assert.deepStrictEqual(chunks, [expectedFirstChunk]);
		await importSecond();
		const expectedSecondChunk = [ID_SECOND, ID_THIRD];
		assert.deepStrictEqual(chunks, [expectedFirstChunk, expectedSecondChunk]);
	},
	options: {
		plugins: [
			{
				name: 'add-chunk-log',
				async resolveDynamicImport(specifier, importer) {
					// Ignore non-static targets
					if (!(typeof specifier === 'string')) return;
					// Get the id and initial meta information of the import target
					const resolved = await this.resolve(specifier, importer);
					// Ignore external targets. Explicit externals have the "external"
					// property while unresolved imports are "null".
					if (resolved && !resolved.external) {
						// We trigger loading the module without waiting for it here
						// because meta information attached by resolveId hooks (that may
						// be contained in "resolved") is only attached to a module the
						// first time it is loaded.
						// That guarantees this meta information, that plugins like
						// commonjs may depend upon, is not lost even if we use "this.load"
						// with just the id in the load hook.
						this.load(resolved);
						return `${DYNAMIC_IMPORT_PROXY_PREFIX}${resolved.id}`;
					}
				},
				async load(id) {
					// Ignore all files but our dynamic import proxies
					if (!id.startsWith('\0dynamic-import:')) return null;
					const actualId = id.slice(DYNAMIC_IMPORT_PROXY_PREFIX.length);
					// To allow loading modules in parallel while keeping complexity low,
					// we do not directly await each "this.load" call but put their
					// promises into an array where we await each entry via an async for
					// loop.
					const moduleInfoPromises = [this.load({ id: actualId, resolveDependencies: true })];
					// We track each loaded dependency here so that we do not load a file
					// twice and also do  not get stuck when there are circular
					// dependencies.
					const dependencies = new Set([actualId]);
					// "importedResolution" tracks the objects created via "resolveId".
					// Again we are using those instead of "importedIds" so that
					// important meta information is not lost.
					for await (const { importedIdResolutions } of moduleInfoPromises) {
						for (const resolved of importedIdResolutions) {
							if (!dependencies.has(resolved.id)) {
								dependencies.add(resolved.id);
								moduleInfoPromises.push(this.load({ ...resolved, resolveDependencies: true }));
							}
						}
					}
					let code = `chunks.push([${[...dependencies]
						.map(JSON.stringify)
						.join(', ')}]); export * from ${JSON.stringify(actualId)};`;
					// Namespace reexports do not reexport default exports, which is why
					// we reexport it manually if it exists
					if (this.getModuleInfo(actualId).hasDefaultExport) {
						code += `export { default } from ${JSON.stringify(actualId)};`;
					}
					return code;
				},
				async resolveId() {
					// We delay resolution just slightly so that we can see the effect of
					// resolveDependencies
					return new Promise(resolve => setTimeout(() => resolve(null), 10));
				}
			}
		]
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_SECOND, ID_THIRD, ID_SECOND],
			message: 'Circular dependency: second.js -> third.js -> second.js'
		}
	]
});
