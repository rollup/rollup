const assert = require('node:assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../testHelpers.js');

describe('misc', () => {
	it('avoids modification of options or their properties', () => {
		const { freeze } = Object;
		return rollup.rollup(
			freeze({
				input: 'input',
				external: freeze([]),
				plugins: freeze([
					{
						name: 'loader',
						resolveId: freeze(() => 'input'),
						load: freeze(() => `export default 0;`)
					}
				]),
				treeshake: freeze({})
			})
		);
	});

	it('warns if node builtins are unresolved in a non-CJS, non-ES bundle (#1051)', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `import { format } from 'util';\nexport default format( 'this is a %s', 'formatted string' );`
					})
				],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle =>
				bundle.generate({
					format: 'iife',
					name: 'myBundle'
				})
			)
			.then(() => {
				const relevantWarnings = warnings.filter(
					warning => warning.code === 'MISSING_NODE_BUILTINS'
				);
				assert.equal(relevantWarnings.length, 1);
				assert.equal(
					relevantWarnings[0].message,
					`Creating a browser bundle that depends on Node.js built-in modules ("util"). You might need to include https://github.com/FredKSchott/rollup-plugin-polyfill-node`
				);
			});
	});

	it('warns when a global module name is guessed in a UMD bundle (#2358)', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'input',
				external: ['lodash'],
				plugins: [
					loader({
						input: `import * as _ from 'lodash'; console.log(_);`
					})
				],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle =>
				bundle.generate({
					format: 'umd',
					globals: [],
					name: 'myBundle'
				})
			)
			.then(() => {
				delete warnings[0].toString;
				assert.deepEqual(warnings, [
					{
						code: 'MISSING_GLOBAL_NAME',
						id: 'lodash',
						message:
							'No name was provided for external module "lodash" in "output.globals" – guessing "_".',
						names: ['_'],
						url: 'https://rollupjs.org/configuration-options/#output-globals'
					}
				]);
			});
	});

	it('sorts chunks in the output', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: ['main1', 'main2'],
				plugins: [
					loader({
						main1: 'import "dep";console.log("main1");',
						main2: 'import "dep";console.log("main2");',
						dep: 'console.log("dep");import("dyndep");',
						dyndep: 'console.log("dyndep");'
					})
				],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => bundle.generate({ format: 'es' }))
			.then(({ output }) => {
				assert.equal(warnings.length, 0);
				assert.deepEqual(
					output.map(({ fileName }) => fileName),
					['main1.js', 'main2.js', 'dep-BED4JKkQ.js', 'dyndep-DOckMt73.js']
				);
			});
	});

	it('applies consistent hashes regardless of chunk transform order', async () => {
		const FILES = {
			main: `
            import('folder1/dupe').then(({dupe}) => console.log(dupe));
            import('folder2/dupe').then(({dupe}) => console.log(dupe));
        `,
			'folder1/dupe': `export const dupe = 'dupe content';`,
			'folder2/dupe': `export const dupe = 'dupe content';`
		};

		async function buildBundle(delayedChunk) {
			const bundle = await rollup.rollup({
				input: 'main',
				plugins: [
					loader(FILES),
					{
						name: 'delay-chunk',
						async renderChunk(_, chunk) {
							if (chunk.facadeModuleId === delayedChunk) {
								await new Promise(resolve => setTimeout(resolve, 100));
							}
							return null;
						}
					}
				]
			});
			return bundle.generate({
				format: 'es',
				chunkFileNames: '[name]-[hash].js'
			});
		}

		const { output: output1 } = await buildBundle('folder1/dupe');
		const { output: output2 } = await buildBundle('folder2/dupe');

		assert.strictEqual(
			output1.length,
			output2.length,
			'Both outputs should have the same number of chunks'
		);

		const sortedOutput1 = output1.sort((a, b) => a.fileName.localeCompare(b.fileName));
		const sortedOutput2 = output2.sort((a, b) => a.fileName.localeCompare(b.fileName));

		for (let index = 0; index < sortedOutput1.length; index++) {
			assert.strictEqual(
				sortedOutput1[index].fileName,
				sortedOutput2[index].fileName,
				`Chunk ${index} should have the same filename in both outputs`
			);
			assert.strictEqual(
				sortedOutput1[index].code,
				sortedOutput2[index].code,
				`Chunk ${index} should have the same code in both outputs`
			);
		}
	});

	it('produces consistent chunk assignments and export names regardless of parallel file read order (#5902)', async () => {
		const FILES = {
			'main1.js': "import './shared.js'; import('./alpha.js'); import('./beta.js');",
			'main2.js': "import './shared.js'; import('./gamma.js'); import('./delta.js');",
			'shared.js':
				"export { shared } from './lib/shared.js'; import './lib/common-1.js'; import './lib/common-2.js';",
			'alpha.js': "import { alpha } from './lib/alpha.js'; console.log(alpha);",
			'beta.js': "import { beta } from './lib/beta.js'; console.log(beta);",
			'gamma.js': "import { gamma } from './lib/gamma.js'; console.log(gamma);",
			'delta.js': "import { delta } from './lib/delta.js'; console.log(delta);",
			'lib/shared.js': "export const shared = 'shared';",
			'lib/common-1.js': "export const common1 = 'common-1';",
			'lib/common-2.js': "export const common2 = 'common-2';",
			'lib/alpha.js':
				"import './tiny/a-1.js'; import './tiny/a-2.js'; export const alpha = 'alpha';",
			'lib/beta.js': "import './tiny/b-1.js'; import './tiny/b-2.js'; export const beta = 'beta';",
			'lib/gamma.js':
				"import './tiny/c-1.js'; import './tiny/c-2.js'; export const gamma = 'gamma';",
			'lib/delta.js':
				"import './tiny/d-1.js'; import './tiny/d-2.js'; export const delta = 'delta';",
			'lib/tiny/a-1.js': "export const a1 = 'a1';",
			'lib/tiny/a-2.js': "export const a2 = 'a2';",
			'lib/tiny/b-1.js': "export const b1 = 'b1';",
			'lib/tiny/b-2.js': "export const b2 = 'b2';",
			'lib/tiny/c-1.js': "export const c1 = 'c1';",
			'lib/tiny/c-2.js': "export const c2 = 'c2';",
			'lib/tiny/d-1.js': "export const d1 = 'd1';",
			'lib/tiny/d-2.js': "export const d2 = 'd2';"
		};

		const buildBundle = async delays => {
			let manualChunkCounter = 0;
			const bundle = await rollup.rollup({
				input: ['main1.js', 'main2.js'],
				maxParallelFileOps: 3,
				plugins: [
					{
						name: 'delayed-loader',
						async resolveId(source, importer) {
							let resolved = source in FILES ? source : null;
							if (!resolved && importer) {
								const dir = importer.includes('/')
									? importer.slice(0, importer.lastIndexOf('/'))
									: '';
								const candidate = dir
									? `${dir}/${source}`.replace(/^\.\//, '').replace(/\/\.\//g, '/')
									: source.replace(/^\.\//, '');
								if (candidate in FILES) resolved = candidate;
							}
							if (!resolved) return null;
							const delay = delays[resolved] ?? 0;
							if (delay > 0) {
								await new Promise(resolve => setTimeout(resolve, delay));
							}
							return resolved;
						},
						load(id) {
							return id in FILES ? FILES[id] : null;
						}
					}
				]
			});

			const { output } = await bundle.generate({
				chunkFileNames: '[name]-[hash].js',
				format: 'es',
				manualChunks(_id) {
					manualChunkCounter++;
					return `chunk-${Math.floor(manualChunkCounter / 2)}`;
				}
			});

			return output
				.map(chunk => ({
					code: chunk.type === 'chunk' ? chunk.code : String(chunk.source),
					fileName: chunk.fileName
				}))
				.sort((chunkA, chunkB) => chunkA.fileName.localeCompare(chunkB.fileName));
		};

		const firstOutput = await buildBundle({
			'lib/alpha.js': 30,
			'lib/gamma.js': 20,
			'lib/tiny/a-1.js': 40,
			'lib/tiny/c-1.js': 10
		});
		const secondOutput = await buildBundle({
			'lib/beta.js': 30,
			'lib/delta.js': 20,
			'lib/tiny/b-1.js': 40,
			'lib/tiny/d-1.js': 10
		});

		assert.deepStrictEqual(secondOutput, firstOutput);
	});

	it('ignores falsy plugins', () =>
		rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` }), null, false, undefined]
		}));

	it('handles different import paths for different outputs', () =>
		rollup
			.rollup({
				input: 'x',
				external: ['the-answer'],
				plugins: [loader({ x: `import 'the-answer'` })]
			})
			.then(bundle =>
				Promise.all([
					bundle
						.generate({ format: 'es' })
						.then(generated =>
							assert.equal(generated.output[0].code, "import 'the-answer';\n", 'no render path 1')
						),
					bundle
						.generate({ format: 'es', paths: id => `//unpkg.com/${id}@?module` })
						.then(generated =>
							assert.equal(
								generated.output[0].code,
								"import '//unpkg.com/the-answer@?module';\n",
								'with render path'
							)
						),
					bundle
						.generate({ format: 'es' })
						.then(generated =>
							assert.equal(generated.output[0].code, "import 'the-answer';\n", 'no render path 2')
						)
				])
			));

	it('does not leak chunk-prefixed render names from one output into another (#6296)', async () => {
		const bundle = await rollup.rollup({
			input: 'main',
			plugins: [
				loader({
					main: `import { _ } from 'helper';\nconsole.log(_);`,
					helper: `export function _(target, property) { return target[property]; }`
				})
			]
		});

		// Generating the chunked CJS first sets `renderBaseName` on the `_`
		// variable to the chunk name (`vendor`). Without resetting render names
		// at the start of each output, the subsequent UMD generate would emit
		// `function vendor._(...)`, which is invalid JavaScript.
		const cjs = await bundle.generate({
			format: 'cjs',
			dir: 'dist',
			manualChunks: id => (id === 'helper' ? 'vendor' : undefined)
		});
		assert.ok(
			cjs.output.some(chunk => chunk.fileName.startsWith('vendor')),
			'CJS output should contain a vendor chunk'
		);

		const umd = await bundle.generate({ format: 'umd', name: 'main' });
		const umdCode = umd.output[0].code;
		assert.ok(
			!/function\s+vendor\./.test(umdCode),
			`UMD output should not contain a dotted function declaration:\n${umdCode}`
		);
		// And the function should still parse — eval the wrapper to verify.
		assert.doesNotThrow(() => new Function(umdCode), 'UMD output should be valid JavaScript');
	});

	it('allows passing the same object to `rollup` and `generate`', () => {
		const options = {
			input: 'input',
			onwarn(warning, handler) {
				if (warning.code !== 'INPUT_HOOK_IN_OUTPUT_PLUGIN') {
					handler(warning);
				}
			},
			plugins: [
				loader({
					input: 'export default 42;'
				})
			],
			output: {
				format: 'es'
			}
		};

		return rollup
			.rollup(options)
			.then(bundle => bundle.generate(options))
			.then(output =>
				assert.strictEqual(
					output.output[0].code,
					'var input = 42;\n\nexport { input as default };\n'
				)
			);
	});

	it('consistently handles comments when using the cache', async () => {
		const FILES = {
			main: `import value from "other";
console.log(value);
/*#__PURE__*/console.log('removed');`,
			other: `var x = "foo";
export default x;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3RoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJvdGhlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFNLENBQUMsR0FBVyxLQUFLLENBQUM7QUFDeEIsZUFBZSxDQUFDLENBQUMifQ==`
		};
		const EXPECTED_OUTPUT = `var x = "foo";

console.log(x);
`;
		const firstBundle = await rollup.rollup({
			input: 'main',
			plugins: [loader(FILES)]
		});
		assert.strictEqual(
			(await firstBundle.generate({ format: 'es' })).output[0].code,
			EXPECTED_OUTPUT,
			'first'
		);
		const secondBundle = await rollup.rollup({
			cache: firstBundle.cache,
			input: 'main',
			plugins: [loader(FILES)]
		});
		assert.strictEqual(
			(await secondBundle.generate({ format: 'es' })).output[0].code,
			EXPECTED_OUTPUT,
			'second'
		);
	});

	it('handles imports from chunks with names that correspond to parent directory names of other chunks', async () => {
		const bundle = await rollup.rollup({
			input: {
				'base/main': 'main.js',
				'base/main/feature': 'feature.js',
				'base/main/feature/sub': 'subfeature.js',
				'base/main/feature/sub/sub': 'subsubfeature.js'
			},
			plugins: [
				loader({
					'main.js': 'export function fn () { return "main"; } console.log(fn());',
					'feature.js': 'import { fn } from "main.js"; console.log(fn() + " feature");',
					'subfeature.js': 'import { fn } from "main.js"; console.log(fn() + " subfeature");',
					'subsubfeature.js': 'import { fn } from "main.js"; console.log(fn() + " subsubfeature");'
				})
			]
		});
		const {
			output: [feature, subfeature, subsubfeature, main]
		} = await bundle.generate({
			entryFileNames: `[name]`,
			chunkFileNames: `[name]`,
			format: 'es'
		});
		assert.strictEqual(main.fileName, 'base/main');
		assert.strictEqual(feature.fileName, 'base/main/feature');
		assert.ok(feature.code.startsWith("import { fn } from '../main'"));
		assert.strictEqual(subfeature.fileName, 'base/main/feature/sub');
		assert.ok(subfeature.code.startsWith("import { fn } from '../../main'"));
		assert.strictEqual(subsubfeature.fileName, 'base/main/feature/sub/sub');
		assert.ok(subsubfeature.code.startsWith("import { fn } from '../../../main'"));
	});

	it('supports rendering es after rendering iife with inlined dynamic imports', async () => {
		const bundle = await rollup.rollup({
			input: 'main.js',
			plugins: [
				loader({
					'main.js': "import('other.js');",
					'other.js': "export const foo = 'bar';"
				})
			]
		});
		await bundle.generate({ format: 'iife', inlineDynamicImports: true });
		await bundle.generate({ format: 'es', exports: 'auto' });
	});

	it('should support `Symbol.asyncDispose` of the rollup bundle and set closed state to true', async () => {
		const bundle = await rollup.rollup({
			input: 'main.js',
			plugins: [
				loader({
					'main.js': "console.log('hello')"
				})
			]
		});

		await bundle[Symbol.asyncDispose]();
		assert.strictEqual(bundle.closed, true);
	});
});
