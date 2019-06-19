const path = require('path');
const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { extend, normaliseOutput, runTestSuiteWithSamples } = require('../utils.js');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];

runTestSuiteWithSamples('form', path.resolve(__dirname, 'samples'), (dir, config) => {
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
								},
								strictDeprecations: true
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
			actualMap.sourcesContent = actualMap.sourcesContent
				? actualMap.sourcesContent.map(normaliseOutput)
				: null;
		} catch (err) {
			assert.equal(err.code, 'ENOENT');
		}

		try {
			expectedMap = JSON.parse(sander.readFileSync(expectedFile + '.map').toString());
			expectedMap.sourcesContent = actualMap.sourcesContent
				? expectedMap.sourcesContent.map(normaliseOutput)
				: null;
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
