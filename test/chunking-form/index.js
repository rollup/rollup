const { basename, resolve } = require('node:path');
const { chdir } = require('node:process');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
const { rollup } = require('../../dist/rollup');
const { runTestSuiteWithSamples, assertDirectoriesAreEqual } = require('../utils.js');

const FORMATS = ['es', 'cjs', 'amd', 'system'];

runTestSuiteWithSamples('chunking form', resolve(__dirname, 'samples'), (directory, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		basename(directory) + ': ' + config.description,
		() => {
			let bundle;

			if (config.before) {
				before(config.before);
			}
			if (config.after) {
				after(config.after);
			}

			for (const format of FORMATS) {
				it('generates ' + format, async () => {
					chdir(directory);
					bundle =
						bundle ||
						(await rollup({
							input: [directory + '/main.js'],
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
				});
			}
		}
	);
});

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
