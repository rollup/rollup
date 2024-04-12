const path = require('node:path');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
// @ts-expect-error not included in types
const { rollup } = require('../../dist/rollup');
const { compareLogs } = require('../utils');
const { runTestSuiteWithSamples, assertDirectoriesAreEqual } = require('../utils.js');

const FORMATS = ['es', 'cjs', 'amd', 'system'];

runTestSuiteWithSamples(
	'chunking form',
	path.resolve(__dirname, 'samples'),
	(directory, config) => {
		(config.skip ? describe.skip : config.solo ? describe.only : describe)(
			path.basename(directory) + ': ' + config.description,
			() => {
				let bundle;

				if (config.before) {
					before(config.before);
				}
				if (config.after) {
					after(config.after);
				}
				const logs = [];
				after(() => config.logs && compareLogs(logs, config.logs));

				for (const format of FORMATS) {
					it('generates ' + format, async () => {
						process.chdir(directory);
						const warnings = [];
						bundle =
							bundle ||
							(await rollup({
								input: [directory + '/main.js'],
								onLog: (level, log) => {
									logs.push({ level, ...log });
									if (level === 'warn' && !config.expectedWarnings?.includes(log.code)) {
										warnings.push(log);
									}
								},
								strictDeprecations: true,
								...config.options
							}));
						await generateAndTestBundle(
							bundle,
							{
								dir: `${directory}/_actual/${format}`,
								exports: 'auto',
								format,
								chunkFileNames: 'generated-[name].js',
								validate: true,
								...(config.options || {}).output
							},
							`${directory}/_expected/${format}`,
							config
						);
						if (warnings.length > 0) {
							const codes = new Set();
							for (const { code } of warnings) {
								codes.add(code);
							}
							throw new Error(
								`Unexpected warnings (${[...codes].join(', ')}): \n${warnings
									.map(({ message }) => `${message}\n\n`)
									.join('')}` +
									'If you expect warnings, list their codes in config.expectedWarnings'
							);
						}
					});
				}
			}
		);
	}
);

async function generateAndTestBundle(bundle, outputOptions, expectedDirectory, config) {
	await bundle.write({
		...outputOptions,
		dir: `${outputOptions.dir}${config.nestedDir ? '/' + config.nestedDir : ''}`
	});
	if (outputOptions.format === 'amd' && config.runAmd) {
		try {
			const exports = await new Promise((resolve, reject) => {
				// @ts-expect-error global
				global.assert = require('node:assert');
				const requirejs = require('requirejs');
				requirejs.config({ baseUrl: outputOptions.dir });
				requirejs([config.nestedDir ? `${config.nestedDir}/main` : 'main'], resolve, reject);
			});
			if (config.runAmd.exports) {
				await config.runAmd.exports(exports);
			}
		} finally {
			delete require.cache[require.resolve('requirejs')];
			// @ts-expect-error global
			delete global.requirejsVars;
			// @ts-expect-error global
			delete global.assert;
		}
	}
	assertDirectoriesAreEqual(outputOptions.dir, expectedDirectory);
}
