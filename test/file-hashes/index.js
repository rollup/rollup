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
							.then(mapGeneratedToHashMap)
					)
				).then(([hashMap1, hashMap2]) => {
					for (const name of config.expectedEqualHashes || []) {
						checkChunkExists(hashMap1, hashMap2, name);
						assert.equal(
							hashMap1[name],
							hashMap2[name],
							`Expected hashes for chunk "${name}" to be equal but they were different.`
						);
					}
					for (const name of config.expectedDifferentHashes || []) {
						checkChunkExists(hashMap1, hashMap2, name);
						assert.notEqual(
							hashMap1[name],
							hashMap2[name],
							`Expected hashes for chunk "${name}" to be different but they were equal.`
						);
					}
				});
			});
		}
	);
});

function mapGeneratedToHashMap(generated) {
	const hashMap = {};
	for (const chunk of generated.output) {
		let name = chunk.name;
		let index = 1;
		while (hashMap[name]) {
			name = `${chunk.name}${index++}`;
		}
		hashMap[name] = chunk.fileName;
	}
	return hashMap;
}

function checkChunkExists(hashMap1, hashMap2, name) {
	[hashMap1, hashMap2].forEach((hashMap, index) =>
		assert.ok(
			hashMap[name],
			`Bundle ${index + 1} did not contain chunk "${name}", found chunks: ${Object.keys(hashMap)
				.map(key => `"${key}"`)
				.join(', ')}`
		)
	);
}
