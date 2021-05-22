const path = require('path');
const rollup = require('../../dist/rollup');
const { runTestSuiteWithSamples, assertDirectoriesAreEqual } = require('../utils.js');

const FORMATS = ['es', 'cjs', 'amd', 'system'];

runTestSuiteWithSamples('chunking form', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			let bundle;

			for (const format of FORMATS) {
				it('generates ' + format, async () => {
					process.chdir(dir);
					bundle =
						bundle ||
						(await rollup.rollup({
							input: [dir + '/main.js'],
							onwarn: warning => {
								if (
									!(config.expectedWarnings && config.expectedWarnings.indexOf(warning.code) >= 0)
								) {
									throw new Error(
										`Unexpected warnings (${warning.code}): ${warning.message}\n` +
											'If you expect warnings, list their codes in config.expectedWarnings'
									);
								}
							},
							strictDeprecations: true,
							...(config.options || {})
						}));
					await generateAndTestBundle(
						bundle,
						{
							dir: `${dir}/_actual/${format}`,
							exports: 'auto',
							format,
							chunkFileNames: 'generated-[name].js',
							validate: true,
							...((config.options || {}).output || {})
						},
						`${dir}/_expected/${format}`,
						config
					);
				});
			}
		}
	);
});

async function generateAndTestBundle(bundle, outputOptions, expectedDir, config) {
	await bundle.write({
		...outputOptions,
		dir: `${outputOptions.dir}${config.nestedDir ? '/' + config.nestedDir : ''}`
	});
	if (outputOptions.format === 'amd' && config.runAmd) {
		try {
			const exports = await new Promise((resolve, reject) => {
				global.assert = require('assert');
				const requirejs = require('requirejs');
				requirejs.config({ baseUrl: outputOptions.dir });
				requirejs([config.nestedDir ? `${config.nestedDir}/main` : 'main'], resolve, reject);
			});
			if (config.runAmd.exports) {
				await config.runAmd.exports(exports);
			}
		} finally {
			delete require.cache[require.resolve('requirejs')];
			delete global.requirejsVars;
			delete global.assert;
		}
	}
	assertDirectoriesAreEqual(outputOptions.dir, expectedDir);
}
