const path = require('node:path');
const { parseAndWalk } = require('../../dist/parseAst');
const { compareError, runTestSuiteWithSamples } = require('../testHelpers.js');
const { readFileSync } = require('node:fs');

runTestSuiteWithSamples(
	'parse-and-walk',
	path.join(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigParseAndWalk} config
	 */
	(directory, config) => {
		(config.skip ? it.skip : config.solo ? it.only : it)(
			path.basename(directory) + ': ' + config.description,
			async () => {
				const code = readFileSync(path.join(directory, 'main.js'), 'utf-8');

				if (config.error) {
					let caughtError = null;
					try {
						await parseAndWalk(code, config.walk, config.parseOptions);
					} catch (error) {
						caughtError = error;
					}

					if (!caughtError) {
						throw new Error('Expected an error but none was thrown');
					}

					compareError(caughtError, config.error);
				} else {
					await parseAndWalk(code, config.walk, config.parseOptions);

					if (config.assertions) {
						await config.assertions();
					}
				}
			}
		);
	}
);
