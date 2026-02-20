// @ts-check
/**
 * @typedef {import('../../src/rollup/types').RollupError} RollupError
 */
const path = require('node:path');
const {
	parseAst,
	parseAstAsync,
	parseLazyAst,
	parseLazyAstAsync,
	parseAndWalk,
	serializeAst,
	deserializeAst
} = require('../../dist/parseAst');
const { expectError, runTestSuiteWithSamples } = require('../testHelpers.js');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');

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

				const expectedError = config.error || config.internalError;
				if (expectedError) {
					await expectError(
						() => parseAndWalk(code, config.walk, config.parseOptions),
						expectedError
					);
					if (config.error) {
						await expectError(() => parseAst(code, config.parseOptions), config.error);
						await expectError(() => parseLazyAst(code, config.parseOptions), config.error);
						await expectError(() => parseAstAsync(code, config.parseOptions), config.error);
						await expectError(() => parseLazyAstAsync(code, config.parseOptions), config.error);
					}
				} else {
					await parseAndWalk(code, config.walk, config.parseOptions);

					if (config.assertions) {
						await config.assertions();
					}
					if (config.expectedAst) {
						assert.deepEqual(parseAst(code, config.parseOptions), config.expectedAst);
						assert.deepEqual(parseLazyAst(code, config.parseOptions), config.expectedAst);
						assert.deepEqual(await parseAstAsync(code, config.parseOptions), config.expectedAst);
						assert.deepEqual(
							await parseLazyAstAsync(code, config.parseOptions),
							config.expectedAst
						);
						assert.deepEqual(deserializeAst(serializeAst(config.expectedAst)), config.expectedAst);
					}
				}
			}
		);
	}
);
