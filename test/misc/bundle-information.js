const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('The bundle object', () => {
	it('contains information about the generated chunks', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input1: `import 'shared';\nconsole.log('input1');\nexport const out = true;`,
						input2: `import 'shared';\nconsole.log('input2');`,
						shared: `console.log('shared');\nexport const unused = null;`
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					chunkFileNames: '[name].js'
				})
			)
			.then(({ output }) => {
				console.log(output);
				console.log(output['chunk.js'].modules);
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['chunk.js', 'input1.js', 'input2.js'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.code),
					[
						"console.log('shared');\n",
						"import './chunk.js';\n\nconsole.log('input1');\nconst out = true;\n\nexport { out };\n",
						"import './chunk.js';\n\nconsole.log('input2');\n"
					],
					'code'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.map), [null, null, null], 'map');
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [false, true, true], 'isEntry');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.imports),
					[[], ['chunk.js'], ['chunk.js']],
					'imports'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.exports), [[], ['out'], []], 'exports');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.modules),
					[
						{
							shared: {
								originalLength: 50,
								removedExports: ['unused'],
								renderedExports: [],
								renderedLength: 22
							}
						},
						{
							input1: {
								originalLength: 64,
								removedExports: [],
								renderedExports: ['out'],
								renderedLength: 40
							}
						},
						{
							input2: {
								originalLength: 39,
								removedExports: [],
								renderedExports: [],
								renderedLength: 22
							}
						}
					],
					'modules'
				);
			});
	});
});
