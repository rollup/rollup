const assert = require('node:assert');
const { rollup } = require('../../dist/rollup');
const { loader } = require('../testHelpers.js');

function runTestCode(code, thisValue, globals) {
	const globalThisDesc = Object.getOwnPropertyDescriptor(global, 'globalThis');
	delete global.globalThis;

	const globalsWithAssert = { ...globals, assert };
	const globalKeys = Object.keys(globalsWithAssert);
	const function_ = new Function(globalKeys, code);
	function_.apply(
		thisValue,
		globalKeys.map(key => globalsWithAssert[key])
	);
	if (globalThisDesc) {
		Object.defineProperty(global, 'globalThis', globalThisDesc);
	}
}

function runNodeTest(code) {
	const module = { exports: {} };
	runTestCode(code, module.exports, {
		module,
		exports: module.exports,
		require: importee => {
			if (importee !== 'external') {
				throw new Error(`Tried to import unknown "${importee}".`);
			}
			return runNodeTest('module.exports = "external";');
		}
	});
	return module.exports;
}

function runAmdTest(code) {
	let defineArguments;
	function define(...parameters) {
		defineArguments = parameters;
	}
	define.amd = true;

	runTestCode(code, undefined, { define });
	if (typeof defineArguments[0] === 'function') {
		return defineArguments[0]() || {};
	}
	const module = { exports: {} };
	const result =
		defineArguments[1](
			...defineArguments[0].map(injection => {
				switch (injection) {
					case 'module': {
						return module;
					}
					case 'exports': {
						return module.exports;
					}
					case 'external': {
						return 'external';
					}
					default: {
						throw new Error(`unexpected AMD injection ${injection}`);
					}
				}
			})
		) || {};
	return defineArguments[0].includes('exports') ? module.exports : result;
}

function runIifeTestWithThis(code, outputOptions) {
	const global = { external: 'external' };
	runTestCode(code, global, {});
	return getAndCheckIifeExports(global, outputOptions);
}

function runStrictIifeTestWithSelf(code, outputOptions) {
	const global = { external: 'external' };
	runTestCode('"use strict";' + code, undefined, { self: global });
	return getAndCheckIifeExports(global, outputOptions);
}

function runStrictIifeTestWithGlobalThis(code, outputOptions) {
	const global = { external: 'external' };
	runTestCode('"use strict";' + code, undefined, { globalThis: global });
	return getAndCheckIifeExports(global, outputOptions);
}

function runIifeWithExistingValuesTest(code, outputOptions) {
	const global = {
		external: 'external',
		bundle: 'previous',
		my: { '@nested/value': { bundle: 'previous' } }
	};
	runTestCode(code, global, {});
	const exports = getAndCheckIifeExports(global, outputOptions);
	if (outputOptions.noConflict) {
		// As "noConflict" was already called when getting the exports, the previous globals should be restored
		assert.deepEqual(
			global,
			{ external: 'external', bundle: 'previous', my: { '@nested/value': { bundle: 'previous' } } },
			'noConflict restores global'
		);
	}
	return exports === 'previous' ? {} : exports;
}

function getAndCheckIifeExports(global, outputOptions) {
	const exports = getIifeExports(global, outputOptions);
	if (outputOptions.noConflict) {
		assert.deepEqual(exports.noConflict(), exports, 'noConflict() returns exports');
		delete exports.noConflict;
	}
	return exports;
}

function getIifeExports(global, outputOptions) {
	if (outputOptions.name) {
		return outputOptions.name
			.split('.')
			.reduce((currentVariable, nextKey) => currentVariable[nextKey] || {}, global);
	}
	return {};
}

async function getUmdCode(inputCode, outputOptions) {
	const bundle = await rollup({
		input: 'input',
		external: ['external'],
		plugins: [loader({ input: inputCode })]
	});
	const { output } = await bundle.generate({
		format: 'umd',
		globals: { external: 'external' },
		...outputOptions
	});
	return output[0].code;
}

function runTestsWithCode(code, outputOptions, expectedExports) {
	let umdCodePromise;

	function getUmdCodePromise() {
		if (umdCodePromise) {
			return umdCodePromise;
		}
		return (umdCodePromise = getUmdCode(code, outputOptions));
	}

	for (const { environmentName, runTest } of [
		{
			environmentName: 'node',
			runTest: runNodeTest
		},
		{
			environmentName: 'amd',
			runTest: runAmdTest
		},
		{
			environmentName: 'iife with this',
			runTest: runIifeTestWithThis
		},
		{
			environmentName: 'strict mode iife with self',
			runTest: runStrictIifeTestWithSelf
		},
		{
			environmentName: 'strict mode iife with globalThis',
			runTest: runStrictIifeTestWithGlobalThis
		},
		{
			environmentName: 'iife with existing globals',
			runTest: runIifeWithExistingValuesTest
		}
	])
		it(`works in ${environmentName} environment`, async () => {
			assert.deepEqual(
				runTest(await getUmdCodePromise(), outputOptions),
				expectedExports,
				'expected exports are returned'
			);
		});
}

for (const name of ['bundle', 'my.@nested/value.bundle'])
	for (const compact of [false, true]) {
		for (const noConflict of [false, true])
			describe(`The UMD wrapper with name="${name}", compact=${compact}, noConflict=${noConflict}`, () => {
				const outputOptions = { compact, name, noConflict };

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
	}

describe('The UMD wrapper with output name as reserved keyword', () => {
	it('Set output name as toString.value', () => {
		getUmdCode('export const x = 42;', { name: 'toString.value' }).then(code => {
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
