const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('misc', () => {
	it('throw modification of options or its property', () => {
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
				acornInjectPlugins: freeze([]),
				acorn: freeze({}),
				experimentalTopLevelAwait: true,
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
					`Creating a browser bundle that depends on Node.js built-in module ('util'). You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
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
						guess: '_',
						message:
							"No name was provided for external module 'lodash' in output.globals – guessing '_'",
						source: 'lodash'
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
				assert.deepEqual(output.map(({ fileName }) => fileName), [
					'main1.js',
					'main2.js',
					'dep-f8bec8a7.js',
					'dyndep-b0a9ee12.js'
				]);
			});
	});

	it('ignores falsy plugins', () => {
		return rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` }), null, false, undefined]
		});
	});

	it('handles different import paths for different outputs', () => {
		return rollup
			.rollup({
				input: 'x',
				external: ['the-answer'],
				plugins: [loader({ x: `import 'the-answer'` })]
			})
			.then(bundle =>
				Promise.all([
					bundle
						.generate({ format: 'esm' })
						.then(generated =>
							assert.equal(generated.output[0].code, "import 'the-answer';\n", 'no render path 1')
						),
					bundle
						.generate({ format: 'esm', paths: id => `//unpkg.com/${id}@?module` })
						.then(generated =>
							assert.equal(
								generated.output[0].code,
								"import '//unpkg.com/the-answer@?module';\n",
								'with render path'
							)
						),
					bundle
						.generate({ format: 'esm' })
						.then(generated =>
							assert.equal(generated.output[0].code, "import 'the-answer';\n", 'no render path 2')
						)
				])
			);
	});
});
