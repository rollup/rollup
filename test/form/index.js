const path = require('path');
const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { extend, loadConfig, normaliseOutput, removeOldTest } = require('../utils.js');

const SAMPLES_DIR = path.resolve(__dirname, 'samples');
const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

describe('form', () => {
	sander
		.readdirSync(SAMPLES_DIR)
		.filter(name => name[0] !== '.')
		.sort()
		.forEach(fileName => runTestsInDir(SAMPLES_DIR + '/' + fileName));
});

function runTestsInDir(dir) {
	const fileNames = sander.readdirSync(dir);

	if (fileNames.indexOf('_config.js') >= 0) {
		runTestCaseInDir(dir);
	} else if (fileNames.indexOf('_actual') >= 0 || fileNames.indexOf('_actual.js') >= 0) {
		removeOldTest(dir);
	} else {
		describe(path.basename(dir), () => {
			fileNames
				.filter(name => name[0] !== '.')
				.sort()
				.forEach(fileName => runTestsInDir(dir + '/' + fileName));
		});
	}
}

function runTestCaseInDir(dir) {
	const config = loadConfig(dir + '/_config.js');
	if (!config || (config.skipIfWindows && process.platform === 'win32')) return;

	const isSingleFormatTest = sander.existsSync(dir + '/_expected.js');
	const itOrDescribe = isSingleFormatTest ? it : describe;
	(config.skip ? itOrDescribe.skip : config.solo ? itOrDescribe.only : itOrDescribe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			let promise;
			const runRollupTest = (inputFile, bundleFile, defaultFormat) => {
				process.chdir(dir);
				return (
					promise ||
					(promise = rollup.rollup(
						extend(
							{
								input: dir + '/main.js',
								onwarn: msg => {
									if (/No name was provided for/.test(msg)) return;
									if (/as external dependency/.test(msg)) return;
									console.error(msg);
								}
							},
							config.options || {}
						)
					))
				).then(bundle =>
					generateAndTestBundle(
						bundle,
						extend(
							{
								file: inputFile,
								format: defaultFormat
							},
							(config.options || {}).output || {}
						),
						bundleFile,
						config
					)
				);
			};

			if (isSingleFormatTest) {
				return runRollupTest(dir + '/_actual.js', dir + '/_expected.js', 'esm');
			}

			FORMATS.forEach(format =>
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
}

function generateAndTestBundle(bundle, outputOptions, expectedFile, { show }) {
	return bundle.write(outputOptions).then(() => {
		const actualCode = normaliseOutput(sander.readFileSync(outputOptions.file));
		let expectedCode;
		let actualMap;
		let expectedMap;

		try {
			expectedCode = normaliseOutput(sander.readFileSync(expectedFile));
		} catch (err) {
			expectedCode = 'missing file';
		}

		try {
			actualMap = JSON.parse(sander.readFileSync(outputOptions.file + '.map').toString());
			actualMap.sourcesContent = actualMap.sourcesContent.map(normaliseOutput);
		} catch (err) {
			assert.equal(err.code, 'ENOENT');
		}

		try {
			expectedMap = JSON.parse(sander.readFileSync(expectedFile + '.map').toString());
			expectedMap.sourcesContent = expectedMap.sourcesContent.map(normaliseOutput);
		} catch (err) {
			assert.equal(err.code, 'ENOENT');
		}

		if (show) {
			console.log(actualCode + '\n\n\n');
		}

		assert.equal(actualCode, expectedCode);
		assert.deepEqual(actualMap, expectedMap);
	});
}
