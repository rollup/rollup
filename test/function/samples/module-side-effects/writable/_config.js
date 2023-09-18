// We prefix the polyfill with \0 to tell other plugins not to try to load or
// transform it
const POLYFILL_ID = '\0polyfill';
const PROXY_SUFFIX = '?inject-polyfill-proxy';

module.exports = defineTest({
	description: 'ModuleInfo.moduleSideEffects should be writable during build time',
	options: {
		treeshake: { moduleSideEffects: false },
		plugins: [
			{
				name: 'inject-polyfill',
				async resolveId(source, importer, options) {
					if (source === POLYFILL_ID) {
						// It is important that side effects are always respected for
						// polyfills, otherwise using treeshake.moduleSideEffects: false
						// may prevent the polyfill from being included.
						return { id: POLYFILL_ID, moduleSideEffects: true };
					}
					if (options.isEntry) {
						// Determine what the actual entry would have been.
						const resolution = await this.resolve(source, importer, options);
						// If it cannot be resolved or is external, just return it so that
						// Rollup can display an error
						if (!resolution || resolution.external) return resolution;
						// In the load hook of the proxy, need to know if the entry has a
						// default export. In the load hook, however, we no longer have the
						// full "resolution" object that may contain meta-data from other
						// plugins that is only added on first load. Therefore we trigger
						// loading here.
						const moduleInfo = await this.load(resolution);
						// We need to make sure side effects in the original entry point
						// are respected even for treeshake.moduleSideEffects: false
						moduleInfo.moduleSideEffects = true;
						// It is important that the new entry does not start with \0 and
						// has the same directory as the original one to not mess up
						// relative external import generation. Also keeping the name and
						// just adding a "?query" to the end ensures that preserveModules
						// will generate the original entry name for this entry.
						return `${resolution.id}${PROXY_SUFFIX}`;
					}
					return null;
				},
				load(id) {
					if (id === POLYFILL_ID) {
						return 'global.polyfilled = true;';
					}
					if (id.endsWith(PROXY_SUFFIX)) {
						const entryId = id.slice(0, -PROXY_SUFFIX.length);
						// We know its ModuleInfo is reliable because we awaited this.load
						// in resolveId
						const { hasDefaultExport } = this.getModuleInfo(entryId);
						let code =
							`import ${JSON.stringify(POLYFILL_ID)};` +
							`export * from ${JSON.stringify(entryId)};`;
						// Namespace reexports do not reexport default, so we need special
						// handling here
						if (hasDefaultExport) {
							code += `export { default } from ${JSON.stringify(entryId)};`;
						}
						return code;
					}
					return null;
				}
			}
		]
	}
});
