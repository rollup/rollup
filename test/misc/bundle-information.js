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
						input1: 'import "shared";\nconsole.log("input1");\nexport const out = true;',
						input2: 'import "shared";\nconsole.log("input2");',
						shared: 'console.log("shared");\nexport const unused = null;'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					chunkFileNames: 'generated-[name].js'
				})
			)
			.then(({ output }) => {
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['generated-chunk.js', 'input1.js', 'input2.js'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.code),
					[
						'console.log("shared");\n',
						'import \'./generated-chunk.js\';\n\nconsole.log("input1");\nconst out = true;\n\nexport { out };\n',
						'import \'./generated-chunk.js\';\n\nconsole.log("input2");\n'
					],
					'code'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.map), [null, null, null], 'map');
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [false, true, true], 'isEntry');
				assert.deepEqual(sortedOutput.map(chunk => chunk.entryModuleId), [null, 'input1', 'input2'], 'entryModuleId');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.imports),
					[[], ['generated-chunk.js'], ['generated-chunk.js']],
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

	it('handles entry facades as entry points but not the facaded chunk', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input1:
							'import {shared} from "shared";import {input2} from "input2";console.log(input2, shared);',
						input2: 'import {shared} from "shared";export const input2 = "input2";',
						shared: 'export const shared = "shared"'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					chunkFileNames: 'generated-[name].js'
				})
			)
			.then(({ output }) => {
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['generated-input2.js', 'input1.js', 'input2.js'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => Object.keys(chunk.modules)),
					[['shared', 'input2'], ['input1'], []],
					'modules'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [false, true, true], 'isEntry');
				assert.deepEqual(sortedOutput.map(chunk => chunk.entryModuleId), [null, 'input1', 'input2'], 'entryModuleId');
			});
	});

	it('prioritizes the proper facade name over the proper facaded chunk name', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input1:
							'import {shared} from "shared";import {input2} from "input2";console.log(input2, shared);',
						input2: 'import {shared} from "shared";export const input2 = "input2";',
						shared: 'export const shared = "shared"'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					entryFileNames: '[name].js',
					chunkFileNames: '[name].js'
				})
			)
			.then(({ output }) => {
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['input1.js', 'input2.js', 'input22.js'],
					'fileName'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.entryModuleId), ['input1', 'input2', null], 'entryModuleId');
			});
	});
});
