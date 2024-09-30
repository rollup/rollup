const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEB = path.join(__dirname, 'deb.js');

module.exports = defineTest({
	description: 'supports using a function that returns a pattern for FileNames',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		plugins: {
			name: 'test-plugin',
			transform(code, id) {
				const baseName = path.basename(id);
				this.emitFile({
					type: 'asset',
					name: `${baseName}.txt`,
					originalFileName: baseName,
					source: 'hello world'
				});
				return null;
			}
		},
		output: {
			entryFileNames: fileInfo => {
				assert.deepStrictEqual(
					fileInfo,
					{
						exports: [],
						facadeModuleId: ID_MAIN,
						isDynamicEntry: false,
						isEntry: true,
						isImplicitEntry: false,
						name: 'main',
						moduleIds: [ID_MAIN],
						type: 'chunk'
					},
					'entry info'
				);
				return `entry-[name]-[hash]-[format].js`;
			},
			assetFileNames: fileInfo => {
				const originalFileName = fileInfo.originalFileName;
				const originalFileNames = ['deb.js', 'main.js'];
				assert.ok(originalFileNames.includes(originalFileName), 'original file name');
				assert.deepStrictEqual(
					fileInfo,
					{
						name: `${originalFileName}.txt`,
						names: ['deb.js.txt', 'main.js.txt'],
						originalFileName,
						originalFileNames,
						source: 'hello world',
						type: 'asset'
					},
					'asset info'
				);
				return '[ext]/[hash]-[name][extname]';
			},
			chunkFileNames: fileInfo => {
				assert.deepStrictEqual(
					fileInfo,
					{
						exports: ['default'],
						facadeModuleId: ID_DEB,
						isDynamicEntry: true,
						isEntry: false,
						isImplicitEntry: false,
						moduleIds: [ID_DEB],
						name: 'deb',
						type: 'chunk'
					},
					'chunk info'
				);
				return 'chunk-[name]-[hash]-[format].js';
			}
		}
	}
});
