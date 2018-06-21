const path = require('path');
const rollup = require('../../dist/rollup');
const { extend, runTestSuiteWithSamples, assertDirectoriesAreEqual } = require('../utils.js');

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
							extend(
								{
									input: [dir + '/main.js'],
									onwarn: msg => {
										if (/No name was provided for/.test(msg)) return;
										if (/as external dependency/.test(msg)) return;
										console.error(msg);
									}
								},
								config.options || {}
							)
						))
					).then(bundle =>
						generateAndTestBundle(
							bundle,
							extend(
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

function generateAndTestBundle(bundle, outputOptions, expectedDir) {
	return bundle
		.write(outputOptions)
		.then(() => assertDirectoriesAreEqual(outputOptions.dir, expectedDir));
}
