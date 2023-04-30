const assert = require('node:assert');
const { existsSync, readFileSync } = require('node:fs');
const { basename, resolve } = require('node:path');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
// @ts-expect-error not included in types
const { rollup } = require('../../dist/rollup');
const { normaliseOutput, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples(
	'form',
	resolve(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigForm} config
	 */
	(directory, config) => {
		const isSingleFormatTest = existsSync(directory + '/_expected.js');
		const itOrDescribe = isSingleFormatTest ? it : describe;
		(config.skip ? itOrDescribe.skip : config.solo ? itOrDescribe.only : itOrDescribe)(
			basename(directory) + ': ' + config.description,
			() => {
				let bundle;
				const runRollupTest = async (inputFile, bundleFile, defaultFormat) => {
					const warnings = [];
					if (config.before) {
						await config.before();
					}
					try {
						process.chdir(directory);
						bundle =
							bundle ||
							(await rollup({
								input: directory + '/main.js',
								onwarn: warning => {
									if (
										!(config.expectedWarnings && config.expectedWarnings.includes(warning.code))
									) {
										warnings.push(warning);
									}
								},
								strictDeprecations: true,
								...config.options
							}));
						await generateAndTestBundle(
							bundle,
							{
								exports: 'auto',
								file: inputFile,
								format: defaultFormat,
								validate: true,
								...(config.options || {}).output
							},
							bundleFile,
							config
						);
					} finally {
						if (config.after) {
							await config.after();
						}
					}
					if (warnings.length > 0) {
						const codes = new Set();
						for (const { code } of warnings) {
							codes.add(code);
						}
						throw new Error(
							`Unexpected warnings (${[...codes].join(', ')}): \n${warnings
								.map(({ message }) => `${message}\n\n`)
								.join('')}` + 'If you expect warnings, list their codes in config.expectedWarnings'
						);
					}
				};

				if (isSingleFormatTest) {
					return runRollupTest(directory + '/_actual.js', directory + '/_expected.js', 'es');
				}

				for (const format of config.formats || FORMATS)
					it('generates ' + format, () =>
						runRollupTest(
							directory + '/_actual/' + format + '.js',
							directory + '/_expected/' + format + '.js',
							format
						)
					);
			}
		);
	}
);

async function generateAndTestBundle(bundle, outputOptions, expectedFile, { show }) {
	await bundle.write(outputOptions);
	const actualCode = normaliseOutput(readFileSync(outputOptions.file, 'utf8'));
	let expectedCode;
	let actualMap;
	let expectedMap;

	try {
		expectedCode = normaliseOutput(readFileSync(expectedFile, 'utf8'));
	} catch {
		expectedCode = 'missing file';
	}

	try {
		actualMap = JSON.parse(readFileSync(outputOptions.file + '.map', 'utf8'));
		actualMap.sourcesContent = actualMap.sourcesContent
			? actualMap.sourcesContent.map(normaliseOutput)
			: null;
	} catch (error) {
		assert.strictEqual(error.code, 'ENOENT');
	}

	try {
		expectedMap = JSON.parse(readFileSync(expectedFile + '.map', 'utf8'));
		expectedMap.sourcesContent = actualMap.sourcesContent
			? expectedMap.sourcesContent.map(normaliseOutput)
			: null;
	} catch (error) {
		assert.equal(error.code, 'ENOENT');
	}

	if (show) {
		console.log(actualCode + '\n\n\n');
	}

	assert.strictEqual(actualCode, expectedCode);
	assert.deepStrictEqual(actualMap, expectedMap);
}
