const assert = require('node:assert');

const prebuiltChunkConsumedProperties = {
	fileName: 'my-chunk.js',
	code: 'exports.foo = "foo"',
	exports: ['foo']
};

module.exports = defineTest({
	description: 'get a right prebuilt chunk',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id === 'my-chunk.js') {
						return {
							id,
							external: true
						};
					}
				},
				buildStart() {
					this.emitFile({
						type: 'prebuilt-chunk',
						...prebuiltChunkConsumedProperties
					});
				},
				generateBundle(_, bundle) {
					const defaultProps = {
						dynamicImports: [],
						facadeModuleId: null,
						implicitlyLoadedBefore: [],
						importedBindings: {},
						imports: [],
						isDynamicEntry: false,
						isEntry: false,
						isImplicitEntry: false,
						moduleIds: [],
						modules: {},
						referencedFiles: [],
						type: 'chunk'
					};
					const { fileName } = prebuiltChunkConsumedProperties;
					assert.deepStrictEqual(bundle[fileName], {
						...defaultProps,
						...prebuiltChunkConsumedProperties,
						name: fileName,
						map: null
					});
				}
			}
		]
	}
});
