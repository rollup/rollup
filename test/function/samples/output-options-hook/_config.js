const assert = require('assert');

module.exports = {
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
					entryFileNames: '[name].js',
					esModule: true,
					exports: 'auto',
					extend: false,
					externalLiveBindings: true,
					format: 'cjs',
					freeze: true,
					generatedCode: {
						arrowFunctions: false,
						constBindings: false,
						objectShorthand: false,
						reservedNamesAsProps: false,
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
					systemNullSetters: false,
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
};
