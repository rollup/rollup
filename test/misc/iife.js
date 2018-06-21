const rollup = require('../../dist/rollup');
const assert = require('assert');
const { loader } = require('../utils.js');

function runTestCode(code, globals) {
	const globalsWithAssert = Object.assign({}, globals, { assert });
	const globalKeys = Object.keys(globalsWithAssert);
	const fn = new Function(globalKeys, code);
	fn.apply(globals, globalKeys.map(key => globalsWithAssert[key]));
}

function runIifeTest(code, outputOptions) {
	const bundleName = outputOptions.name.split('.')[0];
	const globals = { external: 'external', __exports: {} };
	runTestCode(
		bundleName && bundleName.indexOf('@') === -1
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
			.reduce((currentVar, nextKey) => currentVar[nextKey] || {}, global);
	}
	return {};
}

function getIifeCode(inputCode, outputOptions) {
	return rollup
		.rollup({
			input: 'input',
			external: ['external'],
			plugins: [loader({ input: inputCode })]
		})
		.then(bundle =>
			bundle.generate(
				Object.assign({ format: 'iife', globals: { external: 'external' } }, outputOptions)
			)
		)
		.then(({ output }) => output[0].code);
}

function runTestsWithCode(code, outputOptions, expectedExports) {
	it('works with extend=false', () => {
		const options = Object.assign({ extend: false }, outputOptions);
		return getIifeCode(code, options).then(code =>
			assert.deepEqual(
				runIifeTest(code, options),
				expectedExports,
				'expected exports are returned'
			)
		);
	});

	it('works with extend=true', () => {
		const options = Object.assign({ extend: true }, outputOptions);
		return getIifeCode(code, options).then(code =>
			assert.deepEqual(
				runIifeTest(code, options),
				expectedExports,
				'expected exports are returned'
			)
		);
	});
}

['bundle', '@my.@nested/value.bundle'].forEach(name =>
	[false, true].forEach(compact =>
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
		})
	)
);
