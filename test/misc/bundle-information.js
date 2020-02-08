const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('The bundle object', () => {
	it('contains information about the generated chunks', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1-3810e839.js', 'input2-14354d1f.js', 'generated-shared-f6027271.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.code),
					[
						`import './generated-shared-f6027271.js';\n\nconsole.log("input1");const out = true;\n\nexport { out };\n`,
						`import './generated-shared-f6027271.js';\n\nconsole.log("input2");var input2 = 42;\n\nexport default input2;\n`,
						'console.log("shared");\n'
					],
					'code'
				);
				assert.deepEqual(
					output.map(chunk => chunk.map),
					[null, null, null],
					'map'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isEntry),
					[true, true, false],
					'isEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.name),
					['input1', 'input2', 'shared'],
					'name'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null],
					'facadeModuleId'
				);
				assert.deepEqual(
					output.map(chunk => chunk.imports),
					[['generated-shared-f6027271.js'], ['generated-shared-f6027271.js'], []],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[[], [], []],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.exports),
					[['out'], ['default'], []],
					'exports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
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
						},
						{
							shared: {
								originalLength: 49,
								removedExports: ['unused'],
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
				plugins: [
					loader({
						input1:
							'import {shared} from "shared";import {input2} from "input2";console.log(input2, shared);',
						input2: 'import {shared} from "shared";export const input2 = shared + "input2";',
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1.js', 'input2.js', 'generated-input2.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => Object.keys(chunk.modules)),
					[['input1'], [], ['shared', 'input2']],
					'modules'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isEntry),
					[true, true, false],
					'isEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null],
					'facadeModuleId'
				);
			});
	});

	it('prioritizes the proper facade name over the proper facaded chunk name', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
				plugins: [
					loader({
						input1:
							'import {shared} from "shared";import {input2} from "input2";console.log(input2, shared);',
						input2: 'import {shared} from "shared";export const input2 = shared + "input2";',
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1.js', 'input2.js', 'input22.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null],
					'facadeModuleId'
				);
			});
	});

	it('marks dynamic entry points but only marks them as normal entry points if they actually are', () => {
		return rollup
			.rollup({
				input: ['input', 'dynamic1'],
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input.js', 'dynamic1.js', 'generated-dynamic2.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isEntry),
					[true, true, false],
					'isEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.code),
					[
						`Promise.all([import('./dynamic1.js'), import('./generated-dynamic2.js')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n`,
						'const dynamic1 = "dynamic1";\n\nexport { dynamic1 };\n',
						'const dynamic2 = "dynamic2";\n\nexport { dynamic2 };\n'
					],
					'code'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isDynamicEntry),
					[false, true, true],
					'isDynamicEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input', 'dynamic1', 'dynamic2'],
					'facadeModuleId'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[['dynamic1.js', 'generated-dynamic2.js'], [], []],
					'dynamicImports'
				);
			});
	});

	it('handles dynamic entry facades as dynamic entries but not the facaded chunk', () => {
		return rollup
			.rollup({
				input: ['input1', 'input2'],
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1.js', 'input2.js', 'generated-dynamic.js', 'generated-dynamic2.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => Object.keys(chunk.modules)),
					[['input1'], ['input2'], ['dep', 'dynamic'], []],
					'modules'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isDynamicEntry),
					[false, false, false, true],
					'isDynamicEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null, 'dynamic'],
					'facadeModuleId'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[['generated-dynamic.js'], [], [], []],
					'dynamicImports'
				);
			});
	});

	it('removes tree-shaken dynamic imports', () => {
		return rollup
			.rollup({
				input: ['input'],
				plugins: [
					loader({
						input: `export default false ? import('dynamic') : null`,
						dynamic: `export default 'dynamic'`
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.imports),
					[[]],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[[]],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
						{
							input: {
								originalLength: 47,
								removedExports: [],
								renderedExports: ['default'],
								renderedLength: 18
							}
						}
					],
					'modules'
				);
			});
	});

	it('adds correct flags to files when preserving modules', () => {
		return rollup
			.rollup({
				input: ['input', 'dynamic1'],
				preserveModules: true,
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
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['_virtual/input', '_virtual/dynamic1', '_virtual/other', '_virtual/dynamic2'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isEntry),
					[true, true, false, false],
					'isEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.code),
					[
						`import { other } from './other';

console.log(other);Promise.all([import('./dynamic1'), import('./dynamic2')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n`,
						'const dynamic1 = "dynamic1";\n\nexport { dynamic1 };\n',
						'const other = "other";\n\nexport { other };\n',
						'const dynamic2 = "dynamic2";\n\nexport { dynamic2 };\n'
					],
					'code'
				);
				assert.deepEqual(
					output.map(chunk => chunk.name),
					['input', 'dynamic1', 'other', 'dynamic2'],
					'name'
				);
				assert.deepEqual(
					output.map(chunk => chunk.imports),
					[['_virtual/other'], [], [], []],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.exports),
					[[], ['dynamic1'], ['other'], ['dynamic2']],
					'exports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[['_virtual/dynamic1', '_virtual/dynamic2'], [], [], []],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
						{
							input: {
								originalLength: 169,
								removedExports: [],
								renderedExports: [],
								renderedLength: 141
							}
						},
						{
							dynamic1: {
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic1'],
								renderedLength: 28
							}
						},
						{
							other: {
								originalLength: 28,
								removedExports: [],
								renderedExports: ['other'],
								renderedLength: 22
							}
						},
						{
							dynamic2: {
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic2'],
								renderedLength: 28
							}
						}
					],
					'modules'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isDynamicEntry),
					[false, true, false, true],
					'isDynamicEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input', 'dynamic1', 'other', 'dynamic2'],
					'facadeModuleId'
				);
			});
	});

	it('contains correct information about rendered/removedExports when directly exporting items', () => {
		return rollup
			.rollup({
				input: ['input'],
				plugins: [
					loader({
						input:
							'/* removed header */ export { renderedFn, renderedClass, renderedConst } from "code"',
						code:
							'export function renderedFn() {}\nexport function removedFn() {}\n' +
							'export class renderedClass {}\nexport class removedClass {}\n' +
							'export const renderedConst = 1;\nexport const removedConst = 1;'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm'
				})
			)
			.then(({ output: [output] }) => {
				assert.deepEqual(
					output.code,
					'function renderedFn() {}\nclass renderedClass {}\nconst renderedConst = 1;\n\nexport { renderedClass, renderedConst, renderedFn };\n',
					'code'
				);
				assert.deepEqual(
					output.exports,
					['renderedClass', 'renderedConst', 'renderedFn'],
					'exports'
				);
				assert.deepEqual(
					output.modules,
					{
						code: {
							originalLength: 184,
							removedExports: ['removedFn', 'removedClass', 'removedConst'],
							renderedExports: ['renderedFn', 'renderedClass', 'renderedConst'],
							renderedLength: 72
						},
						input: {
							originalLength: 84,
							removedExports: [],
							renderedExports: [],
							renderedLength: 0
						}
					},
					'modules'
				);
			});
	});

	it('contains correct information about rendered/removedExports when using export declaration', () => {
		return rollup
			.rollup({
				input: ['input'],
				plugins: [
					loader({
						input: 'export { renderedFn, renderedClass, renderedConst } from "code"',
						code:
							'function renderedFn() {}\nfunction removedFn() {}\n' +
							'class renderedClass {}\nclass removedClass {}\n' +
							'const renderedConst = 1;\nconst removedConst = 1;\n' +
							'export { renderedFn, renderedClass, renderedConst, removedFn, removedClass, removedConst }'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'esm'
				})
			)
			.then(({ output: [output] }) => {
				assert.deepEqual(
					output.code,
					'function renderedFn() {}\nclass renderedClass {}\nconst renderedConst = 1;\n\nexport { renderedClass, renderedConst, renderedFn };\n',
					'code'
				);
				assert.deepEqual(
					output.exports,
					['renderedClass', 'renderedConst', 'renderedFn'],
					'exports'
				);
				assert.deepEqual(
					output.modules,
					{
						code: {
							originalLength: 233,
							removedExports: ['removedFn', 'removedClass', 'removedConst'],
							renderedExports: ['renderedFn', 'renderedClass', 'renderedConst'],
							renderedLength: 72
						},
						input: {
							originalLength: 63,
							removedExports: [],
							renderedExports: [],
							renderedLength: 0
						}
					},
					'modules'
				);
			});
	});
});
