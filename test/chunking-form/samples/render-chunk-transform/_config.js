const assert = require('node:assert');
const { replaceDirectoryInStringifiedObject } = require('../../../utils');

module.exports = defineTest({
	description: 'replaces hashes when mutating chunk info in renderChunk',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			renderChunk(code, chunk, options, { chunks }) {
				if (chunk.fileName.includes('main2')) {
					const main1Chunk = Object.keys(chunks).find(fileName => fileName.includes('main1'));
					chunk.imports.push(main1Chunk);
					chunk.importedBindings[main1Chunk] = ['added'];
					return `import { added } from ${JSON.stringify(
						`./${main1Chunk}`
					)};\nconsole.log(added);\n${code}`;
				}
				chunk.exports.push('added');
				return `${code}\nexport const added = 'added';`;
			},
			generateBundle(options, bundle) {
				const sanitizedBundle = JSON.parse(
					replaceDirectoryInStringifiedObject(bundle, __dirname).replace(
						/(entry-\w+)-\w+\.js/g,
						(match, name) => `${name}.js`
					)
				);
				for (const fileName of Object.keys(sanitizedBundle)) {
					delete sanitizedBundle[fileName].code;
					delete sanitizedBundle[fileName].modules;
				}

				assert.deepStrictEqual(sanitizedBundle, {
					'entry-main1.js': {
						exports: ['added'],
						facadeModuleId: '**/main1.js',
						isDynamicEntry: false,
						isEntry: true,
						isImplicitEntry: false,
						moduleIds: ['**/main1.js'],
						name: 'main1',
						type: 'chunk',
						dynamicImports: [],
						fileName: 'entry-main1.js',
						implicitlyLoadedBefore: [],
						importedBindings: {},
						imports: [],
						preliminaryFileName: 'entry-main1-!~{001}~.js',
						referencedFiles: [],
						map: null
					},
					'entry-main2.js': {
						exports: [],
						facadeModuleId: '**/main2.js',
						isDynamicEntry: false,
						isEntry: true,
						isImplicitEntry: false,
						moduleIds: ['**/main2.js'],
						name: 'main2',
						type: 'chunk',
						dynamicImports: [],
						fileName: 'entry-main2.js',
						implicitlyLoadedBefore: [],
						importedBindings: { 'entry-main1.js': ['added'] },
						imports: ['entry-main1.js'],
						preliminaryFileName: 'entry-main2-!~{002}~.js',
						referencedFiles: [],
						map: null
					}
				});
			}
		},
		output: {
			entryFileNames: 'entry-[name]-[hash].js',
			chunkFileNames: 'chunk-[name]-[hash].js'
		}
	}
});
