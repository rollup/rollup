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
						input1: 'import "shared";console.log("input1");export const out = true;',
						input2: 'import "shared";console.log("input2");',
						shared: 'console.log("shared");export const unused = null;'
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
						'import \'./generated-chunk.js\';\n\nconsole.log("input1");const out = true;\n\nexport { out };\n',
						'import \'./generated-chunk.js\';\n\nconsole.log("input2");\n'
					],
					'code'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.map), [null, null, null], 'map');
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [false, true, true], 'isEntry');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.entryModuleId),
					[null, 'input1', 'input2'],
					'entryModuleId'
				);
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
								originalLength: 49,
								removedExports: ['unused'],
								renderedExports: [],
								renderedLength: 22
							}
						},
						{
							input1: {
								originalLength: 62,
								removedExports: [],
								renderedExports: ['out'],
								renderedLength: 39
							}
						},
						{
							input2: {
								originalLength: 38,
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
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.entryModuleId),
					[null, 'input1', 'input2'],
					'entryModuleId'
				);
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
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.entryModuleId),
					['input1', 'input2', null],
					'entryModuleId'
				);
			});
	});

	it('marks dynamic entry points but only marks them as normal entry points if they actually are', () => {
		return rollup
			.rollup({
				input: ['input', 'dynamic1'],
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input:
							'Promise.all([import("dynamic1"), import("dynamic2")]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));',
						dynamic1: 'export const dynamic1 = "dynamic1"',
						dynamic2: 'export const dynamic2 = "dynamic2"'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					entryFileNames: '[name].js',
					chunkFileNames: 'generated-[name].js'
				})
			)
			.then(({ output }) => {
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['dynamic1.js', 'generated-chunk.js', 'input.js'],
					'fileName'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [true, false, true], 'isEntry');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.code),
					[
						'const dynamic1 = "dynamic1";\n\nexport { dynamic1 };\n',
						'const dynamic2 = "dynamic2";\n\nexport { dynamic2 };\n',
						'Promise.all([import("./dynamic1.js"), import("./generated-chunk.js")]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n'
					],
					'code'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.isDynamicEntry),
					[true, true, false],
					'isDynamicEntry'
				);
			});
	});
});
