const assert = require('node:assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('The bundle object', () => {
	it('contains information about the generated chunks', () =>
		rollup
			.rollup({
				input: ['input1', 'input2'],
				plugins: [
					loader({
						input1:
							'import shared, {used} from "shared";console.log("input1", used, shared);export const out = true;',
						input2: 'import "shared";console.log("input2");export default 42',
						shared:
							'console.log("shared");export const unused = null;export const used = "used"; export default "stuff";'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'es',
					dir: 'dist',
					chunkFileNames: 'generated-[name]-[hash].js',
					entryFileNames: '[name]-[hash].js'
				})
			)
			.then(({ output }) => {
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1-BM2OP0FT.js', 'input2-5N8un_JB.js', 'generated-shared-CbVywpjf.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.code),
					[
						`import { u as used, s as shared } from './generated-shared-CbVywpjf.js';\n\nconsole.log("input1", used, shared);const out = true;\n\nexport { out };\n`,
						`import './generated-shared-CbVywpjf.js';\n\nconsole.log("input2");var input2 = 42;\n\nexport { input2 as default };\n`,
						`console.log("shared");const used = "used"; var shared = "stuff";\n\nexport { shared as s, used as u };\n`
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
					[['generated-shared-CbVywpjf.js'], ['generated-shared-CbVywpjf.js'], []],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.importedBindings),
					[
						{ 'generated-shared-CbVywpjf.js': ['u', 's'] },
						{ 'generated-shared-CbVywpjf.js': [] },
						{}
					],
					'importedBindings'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[[], [], []],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.exports),
					[['out'], ['default'], ['s', 'u']],
					'exports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
						{
							input1: {
								code: 'console.log("input1", used, shared);const out = true;',
								originalLength: 96,
								removedExports: [],
								renderedExports: ['out'],
								renderedLength: 53
							}
						},
						{
							input2: {
								code: 'console.log("input2");var input2 = 42;',
								originalLength: 55,
								removedExports: [],
								renderedExports: ['default'],
								renderedLength: 38
							}
						},
						{
							shared: {
								code: 'console.log("shared");const used = "used"; var shared = "stuff";',
								originalLength: 100,
								removedExports: ['unused'],
								renderedExports: ['used', 'default'],
								renderedLength: 64
							}
						}
					],
					'modules'
				);
			}));

	it('contains information about external imports and reexports', () =>
		rollup
			.rollup({
				input: ['input'],
				external: ['external1', 'external2', 'external3'],
				plugins: [
					loader({
						input:
							'export {default as foo, bar} from "external1"; import * as external2 from "external2"; export * from "external3"; console.log(external2);'
					})
				]
			})
			.then(bundle =>
				bundle.generate({
					format: 'es',
					dir: 'dist',
					entryFileNames: '[name].js'
				})
			)
			.then(({ output }) => {
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => chunk.code),
					[
						`export { bar, default as foo } from 'external1';\nimport * as external2 from 'external2';\nexport * from 'external3';\n\nconsole.log(external2);\n`
					],
					'code'
				);
				assert.deepEqual(
					output.map(chunk => chunk.map),
					[null],
					'map'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isEntry),
					[true],
					'isEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.name),
					['input'],
					'name'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input'],
					'facadeModuleId'
				);
				assert.deepEqual(
					output.map(chunk => chunk.imports),
					[['external1', 'external2', 'external3']],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.importedBindings),
					[{ external1: ['bar', 'default'], external2: ['*'], external3: ['*'] }],
					'importedBindings'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[[]],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.exports),
					[['*external3', 'bar', 'foo']],
					'exports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
						{
							input: {
								code: 'console.log(external2);',
								originalLength: 137,
								removedExports: [],
								renderedExports: [],
								renderedLength: 23
							}
						}
					],
					'modules'
				);
			}));

	it('handles entry facades as entry points but not the facaded chunk', () =>
		rollup
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
					format: 'es',
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
			}));

	it('prioritizes the proper facade name over the proper facaded chunk name', () =>
		rollup
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
					format: 'es',
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
			}));

	it('marks dynamic entry points but only marks them as normal entry points if they actually are', () =>
		rollup
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
					format: 'es',
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
			}));

	it('handles tainted dynamic entries', () =>
		rollup
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
					format: 'es',
					dir: 'dist',
					entryFileNames: '[name].js',
					chunkFileNames: 'generated-[name].js'
				})
			)
			.then(({ output }) => {
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					['input1.js', 'input2.js', 'generated-dynamic.js'],
					'fileName'
				);
				assert.deepEqual(
					output.map(chunk => Object.keys(chunk.modules)),
					[['input1'], ['input2'], ['dep', 'dynamic']],
					'modules'
				);
				assert.deepEqual(
					output.map(chunk => chunk.isDynamicEntry),
					[false, false, true],
					'isDynamicEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input1', 'input2', null],
					'facadeModuleId'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[['generated-dynamic.js'], [], []],
					'dynamicImports'
				);
			}));

	it('removes tree-shaken dynamic imports', () =>
		rollup
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
					format: 'es',
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
					output.map(chunk => chunk.importedBindings),
					[{}],
					'importedBindings'
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
								code: 'var input = null;',
								originalLength: 47,
								removedExports: [],
								renderedExports: ['default'],
								renderedLength: 17
							}
						}
					],
					'modules'
				);
			}));

	it('adds correct flags to files when preserving modules', () =>
		rollup
			.rollup({
				input: ['input', 'dynamic1'],
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
					format: 'es',
					dir: 'dist',
					entryFileNames: '[name].js',
					chunkFileNames: 'generated-[name].js',
					preserveModules: true
				})
			)
			.then(({ output }) => {
				assert.deepEqual(
					output.map(chunk => chunk.fileName),
					[
						'_virtual/input.js',
						'_virtual/dynamic1.js',
						'_virtual/dynamic2.js',
						'_virtual/other.js'
					],
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
						`import { other } from './other.js';

console.log(other);Promise.all([import('./dynamic1.js'), import('./dynamic2.js')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));\n`,
						'const dynamic1 = "dynamic1";\n\nexport { dynamic1 };\n',
						'const dynamic2 = "dynamic2";\n\nexport { dynamic2 };\n',
						'const other = "other";\n\nexport { other };\n'
					],
					'code'
				);
				assert.deepEqual(
					output.map(chunk => chunk.name),
					['_virtual/input', '_virtual/dynamic1', '_virtual/dynamic2', '_virtual/other'],
					'name'
				);
				assert.deepEqual(
					output.map(chunk => chunk.imports),
					[['_virtual/other.js'], [], [], []],
					'imports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.importedBindings),
					[{ '_virtual/other.js': ['other'] }, {}, {}, {}],
					'importedBindings'
				);
				assert.deepEqual(
					output.map(chunk => chunk.exports),
					[[], ['dynamic1'], ['dynamic2'], ['other']],
					'exports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.dynamicImports),
					[['_virtual/dynamic1.js', '_virtual/dynamic2.js'], [], [], []],
					'dynamicImports'
				);
				assert.deepEqual(
					output.map(chunk => chunk.modules),
					[
						{
							input: {
								code: "console.log(other);Promise.all([import('./dynamic1.js'), import('./dynamic2.js')]).then(([{dynamic1}, {dynamic2}]) => console.log(dynamic1, dynamic2));",
								originalLength: 169,
								removedExports: [],
								renderedExports: [],
								renderedLength: 151
							}
						},
						{
							dynamic1: {
								code: 'const dynamic1 = "dynamic1";',
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic1'],
								renderedLength: 28
							}
						},
						{
							dynamic2: {
								code: 'const dynamic2 = "dynamic2";',
								originalLength: 34,
								removedExports: [],
								renderedExports: ['dynamic2'],
								renderedLength: 28
							}
						},
						{
							other: {
								code: 'const other = "other";',
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
					output.map(chunk => chunk.isDynamicEntry),
					[false, true, true, false],
					'isDynamicEntry'
				);
				assert.deepEqual(
					output.map(chunk => chunk.facadeModuleId),
					['input', 'dynamic1', 'dynamic2', 'other'],
					'facadeModuleId'
				);
			}));

	it('contains correct information about rendered/removedExports when directly exporting items', () =>
		rollup
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
					format: 'es'
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
							code: 'function renderedFn() {}\nclass renderedClass {}\nconst renderedConst = 1;',
							originalLength: 184,
							removedExports: ['removedFn', 'removedClass', 'removedConst'],
							renderedExports: ['renderedFn', 'renderedClass', 'renderedConst'],
							renderedLength: 72
						},
						input: {
							code: null,
							originalLength: 84,
							removedExports: [],
							renderedExports: [],
							renderedLength: 0
						}
					},
					'modules'
				);
			}));

	it('contains correct information about rendered/removedExports when using export declaration', () =>
		rollup
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
					format: 'es'
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
							code: 'function renderedFn() {}\nclass renderedClass {}\nconst renderedConst = 1;',
							originalLength: 233,
							removedExports: ['removedFn', 'removedClass', 'removedConst'],
							renderedExports: ['renderedFn', 'renderedClass', 'renderedConst'],
							renderedLength: 72
						},
						input: {
							code: null,
							originalLength: 63,
							removedExports: [],
							renderedExports: [],
							renderedLength: 0
						}
					},
					'modules'
				);
			}));
});
