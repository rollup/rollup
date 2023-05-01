const path = require('node:path');
/**
 * @type {import('../../src/rollup/types')} Rollup
 */
// @ts-expect-error not included in types
const rollup = require('../../dist/rollup');
// @ts-expect-error not included in types
const { runTestSuiteWithSamples } = require('../utils.js');

runTestSuiteWithSamples(
	'file hashes',
	path.resolve(__dirname, 'samples'),
	/**
	 * @param {import('../types').TestConfigFileHash} config
	 */
	(directory, config) => {
		(config.skip ? describe.skip : config.solo ? describe.only : describe)(
			path.basename(directory) + ': ' + config.description,
			() => {
				it(`generates correct hashes`, () => {
					process.chdir(directory);
					return Promise.all(
						[config.options1, config.options2].map(options =>
							rollup.rollup(options).then(bundle =>
								bundle.generate({
									format: 'es',
									chunkFileNames: '[hash]',
									entryFileNames: '[hash]',
									...options.output
								})
							)
						)
					).then(([generated1, generated2]) => {
						const fileContentsByHash = new Map();
						addFileContentsByFileName(fileContentsByHash, generated1);
						addFileContentsByFileName(fileContentsByHash, generated2);
						if (config.show) {
							console.log(fileContentsByHash);
						}
						for (const contents of fileContentsByHash.values()) {
							if (contents.size > 1) {
								throw new Error(
									`Two chunks contained different code even though the hashes were the same: ${[
										...contents
									]
										.map(error => JSON.stringify(error))
										.join(' != ')}`
								);
							}
						}
					});
				});
			}
		);
	}
);

function addFileContentsByFileName(fileContentsByFileName, generated) {
	for (const chunk of generated.output) {
		const fileName = chunk.fileName;
		if (fileContentsByFileName.has(fileName)) {
			fileContentsByFileName.get(fileName).add(chunk.code);
		} else {
			fileContentsByFileName.set(fileName, new Set([chunk.code]));
		}
	}
}

// assert.equal(
// 	fileContentsByHash.get(hash),
// 	chunk.code,
// 	'Two chunks contained different code even though the hashes were the same.'
// );
