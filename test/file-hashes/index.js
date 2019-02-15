const path = require('path');
const rollup = require('../../dist/rollup');
const { extend, runTestSuiteWithSamples } = require('../utils.js');
const assert = require('assert');

runTestSuiteWithSamples('file hashes', path.resolve(__dirname, 'samples'), (dir, config) => {
	(config.skip ? describe.skip : config.solo ? describe.only : describe)(
		path.basename(dir) + ': ' + config.description,
		() => {
			it(`generates correct hashes`, () => {
				process.chdir(dir);
				return Promise.all(
					[config.options1, config.options2].map(options =>
						rollup
							.rollup(options)
							.then(bundle =>
								bundle.generate(
									extend(
										{ format: 'esm', chunkFileNames: '[hash]', entryFileNames: '[hash]' },
										options.output
									)
								)
							)
					)
				).then(([generated1, generated2]) => {
					const fileContentsByHash = new Map();
					addAndCheckFileContentsByHash(fileContentsByHash, generated1);
					addAndCheckFileContentsByHash(fileContentsByHash, generated2);
				});
			});
		}
	);
});

function addAndCheckFileContentsByHash(fileContentsByHash, generated) {
	for (const chunk of generated.output) {
		const hash = chunk.fileName;
		if (fileContentsByHash.has(hash)) {
			assert.equal(
				fileContentsByHash.get(hash),
				chunk.code,
				'Two chunks contained different code even though the hashes were the same.'
			);
		}
		fileContentsByHash.set(hash, chunk.code);
	}
}
