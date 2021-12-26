const assert = require('assert');
const { existsSync, readFileSync } = require('fs');
const path = require('path');
const rollup = require('../../dist/rollup');
const { normaliseOutput, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples('form', path.resolve(__dirname, 'samples'), (dir, config) => {
	const isSingleFormatTest = existsSync(dir + '/_expected.js');
	const itOrDescribe = isSingleFormatTest ? it : describe;
	(config.skip ? itOrDescribe.skip : config.solo ? itOrDescribe.only : itOrDescribe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			let bundle;
			const runRollupTest = async (inputFile, bundleFile, defaultFormat) => {
				const warnings = [];
				if (config.before) config.before();
				try {
					process.chdir(dir);
					bundle =
						bundle ||
						(await rollup.rollup({
							input: dir + '/main.js',
							onwarn: warning => {
								if (
									!(config.expectedWarnings && config.expectedWarnings.indexOf(warning.code) >= 0)
								) {
									warnings.push(warning);
								}
							},
							strictDeprecations: true,
							...(config.options || {})
						}));
					await generateAndTestBundle(
						bundle,
						{
							exports: 'auto',
							file: inputFile,
							format: defaultFormat,
							validate: true,
							...((config.options || {}).output || {})
						},
						bundleFile,
						config
					);
				} finally {
					if (config.after) config.after();
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
				return runRollupTest(dir + '/_actual.js', dir + '/_expected.js', 'es');
			}

			(config.formats || FORMATS).forEach(format =>
				it('generates ' + format, () =>
					runRollupTest(
						dir + '/_actual/' + format + '.js',
						dir + '/_expected/' + format + '.js',
						format
					)
				)
			);
		}
	);
});

async function generateAndTestBundle(bundle, outputOptions, expectedFile, { show }) {
	await bundle.write(outputOptions);
	const actualCode = normaliseOutput(readFileSync(outputOptions.file, 'utf8'));
	let expectedCode;
	let actualMap;
	let expectedMap;

	try {
		expectedCode = normaliseOutput(readFileSync(expectedFile, 'utf8'));
	} catch (err) {
		expectedCode = 'missing file';
	}

	try {
		actualMap = JSON.parse(readFileSync(outputOptions.file + '.map', 'utf8'));
		actualMap.sourcesContent = actualMap.sourcesContent
			? actualMap.sourcesContent.map(normaliseOutput)
			: null;
	} catch (err) {
		assert.strictEqual(err.code, 'ENOENT');
	}

	try {
		expectedMap = JSON.parse(readFileSync(expectedFile + '.map', 'utf8'));
		expectedMap.sourcesContent = actualMap.sourcesContent
			? expectedMap.sourcesContent.map(normaliseOutput)
			: null;
	} catch (err) {
		assert.equal(err.code, 'ENOENT');
	}

	if (show) {
		console.log(actualCode + '\n\n\n');
	}

	assert.strictEqual(actualCode, expectedCode);
	assert.deepStrictEqual(actualMap, expectedMap);
}
