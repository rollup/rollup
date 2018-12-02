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
						input2: 'import "shared";console.log("input2");export default 42',
						shared: 'console.log("shared");export const unused = null;'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm',
					dir: 'dist',
					chunkFileNames: 'generated-[name]-[hash].js',
					entryFileNames: '[name]-[hash].js'
				})
			)
			.then(({ output }) => {
				const sortedOutput = Object.keys(output)
					.sort()
					.map(key => output[key]);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.fileName),
					['generated-chunk-dc742c8f.js', 'input1-00b2c9b1.js', 'input2-e2618782.js'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.code),
					[
						'console.log("shared");\n',
						`import './generated-chunk-dc742c8f.js';\n\nconsole.log("input1");const out = true;\n\nexport { out };\n`,
						`import './generated-chunk-dc742c8f.js';\n\nconsole.log("input2");var input2 = 42;\n\nexport default input2;\n`
					],
					'code'
				);
				assert.deepEqual(sortedOutput.map(chunk => chunk.map), [null, null, null], 'map');
				assert.deepEqual(sortedOutput.map(chunk => chunk.isEntry), [false, true, true], 'isEntry');
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.name),
					['chunk', 'input1', 'input2'],
					'name'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.facadeModuleId),
					[null, 'input1', 'input2'],
					'facadeModuleId'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.imports),
					[[], ['generated-chunk-dc742c8f.js'], ['generated-chunk-dc742c8f.js']],
					'imports'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.dynamicImports),
					[[], [], []],
					'dynamicImports'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.exports),
					[[], ['out'], ['default']],
					'exports'
				);
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
								originalLength: 55,
								removedExports: [],
								renderedExports: ['default'],
								renderedLength: 38
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
					sortedOutput.map(chunk => chunk.facadeModuleId),
					[null, 'input1', 'input2'],
					'facadeModuleId'
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
					sortedOutput.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null],
					'facadeModuleId'
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
						input: `Promise.all([import('dynamic1'), import('dynamic2')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));`,
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
						`Promise.all([import('./dynamic1.js'), import('./generated-chunk.js')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n`
					],
					'code'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.isDynamicEntry),
					[true, true, false],
					'isDynamicEntry'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.facadeModuleId),
					['dynamic1', 'dynamic2', 'input'],
					'facadeModuleId'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.dynamicImports),
					[[], [], ['dynamic1.js', 'generated-chunk.js']],
					'dynamicImports'
				);
			});
	});

	it('handles dynamic entry facades as dynamic entries but not the facaded chunk', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
				experimentalCodeSplitting: true,
				plugins: [
					loader({
						input1: `import('dynamic').then(({dynamic}) => console.log(dynamic));`,
						input2: `import {dep} from 'dep'; import {dynamic} from 'dynamic'; console.log(dep, dynamic);`,
						dynamic: `import {dep} from 'dep'; console.log(dep); export const dynamic = 'dynamic';`,
						dep: `export const dep = 'dep';`
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
					['generated-chunk.js', 'generated-chunk2.js', 'input1.js', 'input2.js'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => Object.keys(chunk.modules)),
					[['dep', 'dynamic'], [], ['input1'], ['input2']],
					'modules'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.isDynamicEntry),
					[false, true, false, false],
					'isDynamicEntry'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.facadeModuleId),
					[null, 'dynamic', 'input1', 'input2'],
					'facadeModuleId'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.dynamicImports),
					[[], [], ['generated-chunk.js'], []],
					'dynamicImports'
				);
			});
	});

	it('adds correct flags to files when preserving modules', () => {
		return rollup
			.rollup({
				input: ['input', 'dynamic1'],
				experimentalCodeSplitting: true,
				experimentalPreserveModules: true,
				plugins: [
					loader({
						input: `import {other} from "other";console.log(other);Promise.all([import('dynamic1'), import('dynamic2')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));`,
						dynamic1: 'export const dynamic1 = "dynamic1"',
						dynamic2: 'export const dynamic2 = "dynamic2"',
						other: 'export const other = "other"'
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
					['_virtual/dynamic1', '_virtual/dynamic2', '_virtual/input', '_virtual/other'],
					'fileName'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.isEntry),
					[true, false, true, false],
					'isEntry'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.code),
					[
						'const dynamic1 = "dynamic1";\n\nexport { dynamic1 };\n',
						'const dynamic2 = "dynamic2";\n\nexport { dynamic2 };\n',
						`import { other } from './other';

console.log(other);Promise.all([import('./dynamic1'), import('./dynamic2')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n`,
						'const other = "other";\n\nexport { other };\n'
					],
					'code'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.name),
					['dynamic1', 'chunk', 'input', 'chunk'],
					'name'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.imports),
					[[], [], ['_virtual/other'], []],
					'imports'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.exports),
					[['dynamic1'], ['dynamic2'], [], ['other']],
					'exports'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.dynamicImports),
					[[], [], ['_virtual/dynamic1', '_virtual/dynamic2'], []],
					'dynamicImports'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.modules),
					[
						{
							dynamic1: {
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic1'],
								renderedLength: 28
							}
						},
						{
							dynamic2: {
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic2'],
								renderedLength: 28
							}
						},
						{
							input: {
								originalLength: 169,
								removedExports: [],
								renderedExports: [],
								renderedLength: 141
							}
						},
						{
							other: {
								originalLength: 28,
								removedExports: [],
								renderedExports: ['other'],
								renderedLength: 22
							}
						}
					],
					'modules'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.isDynamicEntry),
					[true, true, false, false],
					'isDynamicEntry'
				);
				assert.deepEqual(
					sortedOutput.map(chunk => chunk.facadeModuleId),
					['dynamic1', 'dynamic2', 'input', 'other'],
					'facadeModuleId'
				);
			});
	});
});
