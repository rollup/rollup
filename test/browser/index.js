const { basename, resolve } = require('path');
const fixturify = require('fixturify');
const { rollup } = require('../../dist/rollup.browser.js');
const { assertFilesAreEqual, runTestSuiteWithSamples, compareError } = require('../utils.js');

runTestSuiteWithSamples('browser', resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? it.skip : config.solo ? it.only : it)(
		basename(dir) + ': ' + config.description,
		async () => {
			let bundle;
			try {
				bundle = await rollup({
					input: 'main',
					onwarn: warning => {
						if (!(config.expectedWarnings && config.expectedWarnings.indexOf(warning.code) >= 0)) {
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
			assertOutputMatches(output, dir);
		}
	);
});

function assertOutputMatches(output, dir) {
	const actual = {};
	for (const file of output) {
		const filePath = file.fileName.split('/');
		const fileName = filePath.pop();
		let currentDir = actual;
		for (const pathElement of filePath) {
			if (!currentDir[pathElement]) {
				currentDir[pathElement] = {};
			}
			currentDir = currentDir[pathElement] = currentDir[pathElement] || {};
		}
		currentDir[fileName] = file.source || file.code;
	}
	fixturify.writeSync(resolve(dir, '_actual'), actual);
	const expected = fixturify.readSync(resolve(dir, '_expected'));
	assertFilesAreEqual(actual, expected);
}
