const path = require('path');
const assert = require('assert');
const sander = require('sander');
const rollup = require('../../dist/rollup');
const { extend, loadConfig, normaliseOutput, removeOldTest } = require('../utils.js');

const SAMPLES_DIR = path.resolve(__dirname, 'samples');

const FORMATS = ['amd', 'cjs', 'system', 'es', 'iife', 'umd'];
const CONFIG_FILE_NAME = '_config.js';

describe('form', () => {
	sander
		.readdirSync(SAMPLES_DIR)
		.filter(name => name[0] !== '.')
		.sort()
		.forEach(fileName => runTestsInDir(SAMPLES_DIR + '/' + fileName));
});

function runTestsInDir(dir) {
	const fileNames = sander.readdirSync(dir);

	if (fileNames.indexOf(CONFIG_FILE_NAME) >= 0) {
		runSingleTestInDir(dir);
	} else if (fileNames.indexOf('_actual') >= 0) {
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

function runSingleTestInDir(dir) {
	const config = loadConfig(dir + '/_config.js');

	if (!config || (config.skipIfWindows && process.platform === 'win32')) return;
	if (!config.options) {
		config.options = {};
	}

	const inputOptions = extend(
		{},
		{
			input: dir + '/main.js',
			onwarn: msg => {
				if (/No name was provided for/.test(msg)) return;
				if (/as external dependency/.test(msg)) return;
				console.error(msg);
			}
		},
		config.options
	);

	(config.skip ? describe.skip : config.solo ? describe.only : describe)(path.basename(dir), () => {
		let promise;
		const createBundle = () => promise || (promise = rollup.rollup(inputOptions));

		FORMATS.forEach(format => {
			it('generates ' + format, () => {
				process.chdir(dir);

				return createBundle().then(bundle => {
					const outputOptions = extend(
						{},
						{
							file: dir + '/_actual/' + format + '.js',
							format
						},
						inputOptions.output || {}
					);

					return bundle.write(outputOptions).then(() => {
						const actualCode = normaliseOutput(sander.readFileSync(dir, '_actual', format + '.js'));
						let expectedCode;
						let actualMap;
						let expectedMap;

						try {
							expectedCode = normaliseOutput(sander.readFileSync(dir, '_expected', format + '.js'));
						} catch (err) {
							expectedCode = 'missing file';
						}

						try {
							actualMap = JSON.parse(
								sander.readFileSync(dir, '_actual', format + '.js.map').toString()
							);
							actualMap.sourcesContent = actualMap.sourcesContent.map(normaliseOutput);
						} catch (err) {
							assert.equal(err.code, 'ENOENT');
						}

						try {
							expectedMap = JSON.parse(
								sander.readFileSync(dir, '_expected', format + '.js.map').toString()
							);
							expectedMap.sourcesContent = expectedMap.sourcesContent.map(normaliseOutput);
						} catch (err) {
							assert.equal(err.code, 'ENOENT');
						}

						if (config.show) {
							console.log(actualCode + '\n\n\n');
						}

						assert.equal(actualCode, expectedCode);
						assert.deepEqual(actualMap, expectedMap);
					});
				});
			});
		});
	});
}
