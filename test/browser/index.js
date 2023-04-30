// since we don't run the browser tests in an actual browser, we need to make `performance`
// globally accessible same as in the browser. this can be removed once `performance` is
// available globally in all supported platforms. [currently global for node.js v16+].
// @ts-expect-error ignore
global.performance = require('node:perf_hooks').performance;

const { basename, resolve } = require('node:path');
const fixturify = require('fixturify');

/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const { rollup } = require('../../browser/dist/rollup.browser.js');
const { assertFilesAreEqual, runTestSuiteWithSamples, compareError } = require('../utils.js');

runTestSuiteWithSamples(
	'browser',
	resolve(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigBrowser} config
	 */
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			basename(directory) + ': ' + config.description,
			async () => {
				let bundle;
				try {
					bundle = await rollup({
						input: 'main',
						onwarn: warning => {
							if (!(config.expectedWarnings && config.expectedWarnings.includes(warning.code))) {
								throw new Error(
									`Unexpected warnings (${warning.code}): ${warning.message}\n` +
										'If you expect warnings, list their codes in config.expectedWarnings'
								);
							}
						},
						strictDeprecations: true,
						...config.options
					});
				} catch (error) {
					if (config.error) {
						compareError(error, config.error);
						return;
					} else {
						throw error;
					}
				}
				if (config.error) {
					throw new Error('Expected an error while rolling up');
				}
				let output;
				try {
					({ output } = await bundle.generate({
						exports: 'auto',
						format: 'es',
						...(config.options || {}).output
					}));
				} catch (error) {
					if (config.generateError) {
						compareError(error, config.generateError);
						return;
					} else {
						throw error;
					}
				}
				if (config.generateError) {
					throw new Error('Expected an error while generating output');
				}
				assertOutputMatches(output, directory);
			}
		);
	}
);

function assertOutputMatches(output, directory) {
	/** @type any */
	const actual = {};
	for (const file of output) {
		const filePath = file.fileName.split('/');
		const fileName = filePath.pop();
		let currentDirectory = actual;
		for (const pathElement of filePath) {
			if (!currentDirectory[pathElement]) {
				currentDirectory[pathElement] = {};
			}
			currentDirectory = currentDirectory[pathElement] = currentDirectory[pathElement] || {};
		}
		currentDirectory[fileName] = file.source || file.code;
	}
	fixturify.writeSync(resolve(directory, '_actual'), actual);
	const expected = fixturify.readSync(resolve(directory, '_expected'));
	assertFilesAreEqual(actual, expected);
}
