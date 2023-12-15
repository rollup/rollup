const assert = require('node:assert');
const { existsSync, readFileSync } = require('node:fs');
const { basename, resolve } = require('node:path');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
// @ts-expect-error not included in types
const { rollup } = require('../../dist/rollup');
const {
	compareLogs,
	normaliseOutput,
	runTestSuiteWithSamples,
	verifyAstPlugin
} = require('../utils.js');

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
				const logs = [];

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
								onLog: (level, log) => {
									logs.push({ level, ...log });
									if (level === 'warn' && !config.expectedWarnings?.includes(log.code)) {
										warnings.push(log);
									}
								},
								strictDeprecations: true,
								...config.options,
								plugins:
									config.verifyAst === false
										? config.options?.plugins
										: config.options?.plugins === undefined
											? verifyAstPlugin
											: Array.isArray(config.options.plugins)
												? [...config.options.plugins, verifyAstPlugin]
												: config.options.plugins
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
					return runRollupTest(directory + '/_actual.js', directory + '/_expected.js', 'es').then(
						() => config.logs && compareLogs(logs, config.logs)
					);
				}

				for (const format of config.formats || FORMATS) {
					after(() => config.logs && compareLogs(logs, config.logs));

					it('generates ' + format, () =>
						runRollupTest(
							directory + '/_actual/' + format + '.js',
							directory + '/_expected/' + format + '.js',
							format
						)
					);
				}
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
