// since we don't run the browser tests in an actual browser, we need to make `performance`
// globally accessible same as in the browser. this can be removed once `performance` is
// available globally in all supported platforms. [currently global for node.js v16+].
const { readFile } = require('node:fs/promises');
const path = require('node:path');

global.performance = require('node:perf_hooks').performance;

global.fetch = url => readFile(url.href.replace('file://', ''));

const fixturify = require('fixturify');

/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const { rollup } = require('../../browser/dist/rollup.browser.js');
const { assertFilesAreEqual, runTestSuiteWithSamples, compareError } = require('../testHelpers.js');

runTestSuiteWithSamples(
	'browser',
	path.resolve(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigBrowser} config
	 */
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			path.basename(directory) + ': ' + config.description,
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
		).timeout(30_000);
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
	fixturify.writeSync(path.resolve(directory, '_actual'), actual);
	const expected = fixturify.readSync(path.resolve(directory, '_expected'));
	assertFilesAreEqual(actual, expected);
}
