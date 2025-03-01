const assert = require('node:assert');
// @ts-expect-error not included in types
const { replaceDirectoryInStringifiedObject } = require('../../../testHelpers');
const assertChunkData = chunk =>
	assert.strictEqual(
		replaceDirectoryInStringifiedObject({ ...chunk, fileName: undefined }, __dirname),
		'{\n' +
			'  "exports": [],\n' +
			'  "facadeModuleId": "**/main.js",\n' +
			'  "isDynamicEntry": false,\n' +
			'  "isEntry": true,\n' +
			'  "isImplicitEntry": false,\n' +
			'  "moduleIds": [\n' +
			'    "**/main.js"\n' +
			'  ],\n' +
			'  "name": "main",\n' +
			'  "type": "chunk",\n' +
			'  "dynamicImports": [],\n' +
			'  "implicitlyLoadedBefore": [],\n' +
			'  "importedBindings": {},\n' +
			'  "imports": [],\n' +
			'  "modules": {\n' +
			'    "**/main.js": {\n' +
			'      "code": "console.log(\'main\');",\n' +
			'      "originalLength": 21,\n' +
			'      "removedExports": [],\n' +
			'      "renderedExports": [],\n' +
			'      "renderedLength": 20\n' +
			'    }\n' +
			'  },\n' +
			'  "referencedFiles": []\n' +
			'}'
	);

module.exports = defineTest({
	description: 'provides module information when adding addons',
	options: {
		output: {
			intro(chunk) {
				assertChunkData(chunk);
				return `/* intro-option ${chunk.fileName} */`;
			},
			outro(chunk) {
				assertChunkData(chunk);
				return `/* outro-option ${chunk.fileName} */`;
			},
			banner(chunk) {
				assertChunkData(chunk);
				return `/* banner-option ${chunk.fileName} */`;
			},
			footer(chunk) {
				assertChunkData(chunk);
				return `/* footer-option ${chunk.fileName} */`;
			}
		},
		plugins: [
			{
				name: 'first',
				intro(chunk) {
					assertChunkData(chunk);
					return `/* intro-first ${chunk.fileName} */`;
				},
				outro(chunk) {
					assertChunkData(chunk);
					return `/* outro-first ${chunk.fileName} */`;
				},
				banner(chunk) {
					assertChunkData(chunk);
					return `/* banner-first ${chunk.fileName} */`;
				},
				footer(chunk) {
					assertChunkData(chunk);
					return `/* footer-first ${chunk.fileName} */`;
				}
			},
			{
				name: 'second',
				intro(chunk) {
					assertChunkData(chunk);
					return `/* intro-second ${chunk.fileName} */`;
				},
				outro(chunk) {
					assertChunkData(chunk);
					return `/* outro-second ${chunk.fileName} */`;
				},
				banner(chunk) {
					assertChunkData(chunk);
					return `/* banner-second ${chunk.fileName} */`;
				},
				footer(chunk) {
					assertChunkData(chunk);
					return `/* footer-second ${chunk.fileName} */`;
				}
			}
		]
	}
});
