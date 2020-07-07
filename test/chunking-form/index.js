const path = require('path');
const rollup = require('../../dist/rollup');
const { runTestSuiteWithSamples, assertDirectoriesAreEqual } = require('../utils.js');

const FORMATS = ['es', 'cjs', 'amd', 'system'];

runTestSuiteWithSamples('chunking form', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			let rollupPromise;

			FORMATS.forEach(format =>
				it('generates ' + format, () => {
					process.chdir(dir);
					return (
						rollupPromise ||
						(rollupPromise = rollup.rollup(
							Object.assign(
								{
									input: [dir + '/main.js'],
									onwarn: warning => {
										if (
											!(
												config.expectedWarnings &&
												config.expectedWarnings.indexOf(warning.code) >= 0
											)
										) {
											throw new Error(
												`Unexpected warnings (${warning.code}): ${warning.message}\n` +
													'If you expect warnings, list their codes in config.expectedWarnings'
											);
										}
									},
									strictDeprecations: true
								},
								config.options || {}
							)
						))
					).then(bundle =>
						generateAndTestBundle(
							bundle,
							Object.assign(
								{
									dir: dir + '/_actual/' + format,
									format,
									chunkFileNames: 'generated-[name].js'
								},
								(config.options || {}).output || {}
							),
							dir + '/_expected/' + format,
							config
						)
					);
				})
			);
		}
	);
});

function generateAndTestBundle(bundle, outputOptions, expectedDir, config) {
	return bundle
		.write(outputOptions)
		.then(() => {
			if (outputOptions.format === 'amd' && config.runAmd) {
				return new Promise(resolve => {
					global.assert = require('assert');
					const requirejs = require('requirejs');
					requirejs.config({ baseUrl: outputOptions.dir });
					requirejs(['main'], main => {
						Promise.resolve(config.runAmd.exports && config.runAmd.exports(main)).then(resolve);
					});
				});
			}
		})
		.then(() => assertDirectoriesAreEqual(outputOptions.dir, expectedDir));
}
