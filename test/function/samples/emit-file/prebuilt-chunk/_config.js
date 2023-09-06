const assert = require('node:assert');

const prebuiltChunk1ConsumedProperties = {
	fileName: 'my-chunk.js',
	code: 'exports.foo = "foo"',
	exports: ['foo']
};

const prebuiltChunk2ConsumedProperties = {
	fileName: 'my-chunk2.js',
	code: 'assert.ok(true)'
};

module.exports = defineTest({
	description: 'get right prebuilt chunks',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (
						[
							prebuiltChunk1ConsumedProperties.fileName,
							prebuiltChunk2ConsumedProperties.fileName
						].includes(id)
					) {
						return {
							id,
							external: true
						};
					}
				},
				buildStart() {
					const referenceId = this.emitFile({
						type: 'prebuilt-chunk',
						...prebuiltChunk1ConsumedProperties
					});
					assert.strictEqual(
						this.getFileName(referenceId),
						prebuiltChunk1ConsumedProperties.fileName
					);
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
					const { fileName } = prebuiltChunk1ConsumedProperties;
					assert.deepStrictEqual(bundle[fileName], {
						...defaultProps,
						...prebuiltChunk1ConsumedProperties,
						name: fileName,
						map: null,
						sourcemapFileName: null,
						preliminaryFileName: 'my-chunk.js'
					});
					this.emitFile({
						type: 'prebuilt-chunk',
						...prebuiltChunk2ConsumedProperties
					});
					const { fileName: fileName2 } = prebuiltChunk2ConsumedProperties;
					assert.deepStrictEqual(bundle[fileName2], {
						...defaultProps,
						...prebuiltChunk2ConsumedProperties,
						name: fileName2,
						exports: [],
						map: null,
						sourcemapFileName: null,
						preliminaryFileName: 'my-chunk2.js'
					});
				}
			}
		]
	}
});
