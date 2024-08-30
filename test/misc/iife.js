const assert = require('node:assert');
const { rollup } = require('../../dist/rollup');
const { loader } = require('../utils.js');
const { compareError } = require('../utils.js');

function runTestCode(code, globals) {
	const globalsWithAssert = { ...globals, assert };
	const globalKeys = Object.keys(globalsWithAssert);
	const function_ = new Function(globalKeys, code);
	function_.apply(
		globals,
		globalKeys.map(key => globalsWithAssert[key])
	);
}

function runIifeTest(code, outputOptions) {
	const bundleName = outputOptions.name.split('.')[0];
	const globals = { external: 'external', __exports: {} };
	runTestCode(
		bundleName && !bundleName.includes('@')
			? `${code}if (typeof ${bundleName} !== 'undefined') __exports.${bundleName} = ${bundleName};`
			: code,
		globals
	);
	return getIifeExports(globals.__exports[bundleName] ? globals.__exports : globals, outputOptions);
}

function getIifeExports(global, outputOptions) {
	if (outputOptions.name) {
		return outputOptions.name
			.split('.')
			.reduce((currentVariable, nextKey) => currentVariable[nextKey] || {}, global);
	}
	return {};
}

function getIifeCode(inputCode, outputOptions) {
	return rollup({
		input: 'input',
		external: ['external'],
		plugins: [loader({ input: inputCode })]
	})
		.then(bundle =>
			bundle.generate({ format: 'iife', globals: { external: 'external' }, ...outputOptions })
		)
		.then(({ output }) => output[0].code);
}

function runTestsWithCode(code, outputOptions, expectedExports) {
	it('works with extend=false', () => {
		const options = { extend: false, ...outputOptions };
		return getIifeCode(code, options).then(code =>
			assert.deepEqual(runIifeTest(code, options), expectedExports, 'expected exports are returned')
		);
	});

	it('works with extend=true', () => {
		const options = { extend: true, ...outputOptions };
		return getIifeCode(code, options).then(code =>
			assert.deepEqual(runIifeTest(code, options), expectedExports, 'expected exports are returned')
		);
	});
}

for (const name of ['bundle', '@my.@nested/value.bundle'])
	for (const compact of [false, true])
		describe(`The IIFE wrapper with name="${name}", compact=${compact}`, () => {
			const outputOptions = { compact, name };

			describe('creating a bundle with neither exports nor imports', () =>
				runTestsWithCode('assert.ok(true);', outputOptions, {}));

			describe('creating a bundle with named exports', () =>
				runTestsWithCode('export const x = 42;', outputOptions, { x: 42 }));

			describe('creating a bundle with a default export', () =>
				runTestsWithCode('export default {value: 42};', outputOptions, { value: 42 }));

			describe('creating a bundle with an external import', () =>
				runTestsWithCode(
					'import value from "external"; assert.equal(value, "external");',
					outputOptions,
					{}
				));

			describe('creating a bundle with an external import and named exports', () =>
				runTestsWithCode('import value from "external"; export const x = value;', outputOptions, {
					x: 'external'
				}));

			describe('creating a bundle with an external import and a default export', () =>
				runTestsWithCode('import value from "external"; export default {value};', outputOptions, {
					value: 'external'
				}));
		});

describe('The IIFE wrapper with an illegal name', () => {
	it('fails if the name starts with a digit', () =>
		getIifeCode('export const x = 42;', { name: '1name' })
			.then(() => {
				throw new Error('Expected an error to be thrown.');
			})
			.catch(error =>
				compareError(error, {
					code: 'ILLEGAL_IDENTIFIER_AS_NAME',
					message:
						'Given name "1name" is not a legal JS identifier. If you need this, you can try "output.extend: true".',
					url: 'https://rollupjs.org/configuration-options/#output-extend'
				})
			));

	it('fails if the name contains an illegal character', () =>
		getIifeCode('export const x = 42;', { name: 'my=name' })
			.then(() => {
				throw new Error('Expected an error to be thrown.');
			})
			.catch(error =>
				compareError(error, {
					code: 'ILLEGAL_IDENTIFIER_AS_NAME',
					message:
						'Given name "my=name" is not a legal JS identifier. If you need this, you can try "output.extend: true".',
					url: 'https://rollupjs.org/configuration-options/#output-extend'
				})
			));

	it('does not fail for illegal characters if the extend option is used', () =>
		getIifeCode('export const x = 42;', { name: 'my=name', extend: true }).then(code =>
			assert.strictEqual(
				code,
				'(function (exports) {\n' +
					"\t'use strict';\n" +
					'\n' +
					'\tconst x = 42;\n' +
					'\n' +
					'\texports.x = x;\n' +
					'\n' +
					'})(this["my=name"] = this["my=name"] || {});\n'
			)
		));
});

describe('The IIFE wrapper with output name as reserved keyword', () => {
	it('Set output name as toString.value', () => {
		getIifeCode('export const x = 42;', { name: 'toString.value' }).then(code => {
			assert.deepEqual(
				code,
				'this.toString = this.toString || {};\n' +
					'this.toString.value = (function (exports) {\n' +
					"'use strict';\n\n" +
					'const x = 42;\n\n' +
					'exports.x = x;\n\n' +
					'return exports;\n\n' +
					'})({});'
			);
		});
	});
});
