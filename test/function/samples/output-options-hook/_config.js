const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows to read and modify options in the options hook',
	exports(exports) {
		assert.deepStrictEqual(exports, {
			foo: 42,
			bar: 43
		});
	},
	options: {
		output: {
			banner: "throw new Error('unused')"
		},
		plugins: {
			name: 'test-plugin',
			renderChunk(code, chunk, options) {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), {
					amd: {
						define: 'define',
						autoId: false,
						forceJsExtensionForImports: false
					},
					assetFileNames: 'assets/[name]-[hash][extname]',
					chunkFileNames: '[name]-[hash].js',
					compact: false,
					dynamicImportInCjs: true,
					entryFileNames: '[name].js',
					esModule: 'if-default-prop',
					experimentalDeepDynamicChunkOptimization: false,
					experimentalMinChunkSize: 1,
					exports: 'auto',
					extend: false,
					externalImportAssertions: true,
					externalLiveBindings: true,
					format: 'cjs',
					freeze: true,
					generatedCode: {
						arrowFunctions: false,
						constBindings: false,
						objectShorthand: false,
						reservedNamesAsProps: true,
						symbols: false
					},
					globals: {},
					hoistTransitiveImports: true,
					indent: true,
					inlineDynamicImports: false,
					manualChunks: {},
					minifyInternalExports: false,
					namespaceToStringTag: false,
					noConflict: false,
					paths: {},
					plugins: [],
					preferConst: false,
					preserveModules: false,
					sourcemap: false,
					sourcemapExcludeSources: false,
					strict: true,
					systemNullSetters: true,
					validate: false
				});
				assert.strictEqual(options.banner(), 'exports.bar = 43;');
				assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
				assert.strictEqual(this.meta.watchMode, false);
			},
			outputOptions(options) {
				assert.deepStrictEqual(JSON.parse(JSON.stringify(options)), {
					banner: "throw new Error('unused')",
					exports: 'auto',
					format: 'cjs'
				});
				assert.ok(/^\d+\.\d+\.\d+/.test(this.meta.rollupVersion));
				assert.strictEqual(this.meta.watchMode, false);
				return { ...options, banner: 'exports.bar = 43;' };
			}
		}
	}
});
