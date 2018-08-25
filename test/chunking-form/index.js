const path = require('path');
const assert = require('assert');
const fixturify = require('fixturify');
const rollup = require('../../dist/rollup');
const { extend, runTestSuiteWithSamples } = require('../utils.js');

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
									experimentalCodeSplitting: true,
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
									format
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
	return bundle.write(outputOptions).then(() => {
		const actualFiles = fixturify.readSync(outputOptions.dir);

		let expectedFiles;
		try {
			expectedFiles = fixturify.readSync(expectedDir);
		} catch (err) {
			expectedFiles = [];
		}
		assertFilesAreEqual(actualFiles, expectedFiles, []);
	});
}

function assertFilesAreEqual(actualFiles, expectedFiles, dirs) {
	Object.keys(Object.assign({}, actualFiles, expectedFiles)).forEach(fileName => {
		const pathSegments = dirs.concat(fileName);
		if (typeof actualFiles[fileName] === 'object' && typeof expectedFiles[fileName] === 'object') {
			return assertFilesAreEqual(actualFiles[fileName], expectedFiles[fileName], pathSegments);
		}

		const shortName = pathSegments.join('/');
		assert.strictEqual(
			`${shortName}: ${actualFiles[fileName]}`,
			`${shortName}: ${expectedFiles[fileName]}`
		);
	});
}
