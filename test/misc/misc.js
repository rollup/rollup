const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('misc', () => {
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

	it('warns when globals option is specified and a global module name is guessed in a UMD bundle (#2358)', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `import * as _ from 'lodash'`
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
				const relevantWarnings = warnings.filter(warning => warning.code === 'MISSING_GLOBAL_NAME');
				assert.equal(relevantWarnings.length, 1);
				assert.equal(
					relevantWarnings[0].message,
					`No name was provided for external module 'lodash' in output.globals – guessing 'lodash'`
				);
			});
	});

	it('ignores falsy plugins', () => {
		return rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` }), null, false, undefined]
		});
	});
});
