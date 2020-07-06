const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEB = path.join(__dirname, 'deb.js');

module.exports = {
	description: 'supports using a function that returns a pattern for FileNames',
	options: {
		input: ['main.js'],
		plugins: {
			transform() {
				this.emitFile({ type: 'asset', name: 'test.txt', source: 'hello world' });
				return null;
			}
		},
		output: {
			entryFileNames: fileInfo => {
				// This is checked separately as deepStrictEqual is having some issues
				assert.deepStrictEqual(Object.keys(fileInfo.modules), [ID_MAIN]);
				delete fileInfo.modules;
				assert.deepStrictEqual(
					fileInfo,
					{
						exports: [],
						facadeModuleId: ID_MAIN,
						isDynamicEntry: false,
						isEntry: true,
						isImplicitEntry: false,
						name: 'main',
						type: 'chunk'
					},
					'entry info'
				);
				return `entry-[name]-[hash]-[format].js`;
			},
			assetFileNames: fileInfo => {
				assert.deepStrictEqual(
					fileInfo,
					{
						name: 'test.txt',
						source: 'hello world',
						type: 'asset'
					},
					'asset info'
				);
				return '[ext]/[hash]-[name][extname]';
			},
			chunkFileNames: fileInfo => {
				// This is checked separately as deepStrictEqual is having some issues
				assert.deepStrictEqual(Object.keys(fileInfo.modules), [ID_DEB]);
				delete fileInfo.modules;
				assert.deepStrictEqual(
					fileInfo,
					{
						exports: ['default'],
						facadeModuleId: ID_DEB,
						isDynamicEntry: true,
						isEntry: false,
						isImplicitEntry: false,
						name: 'deb',
						type: 'chunk'
					},
					'chunk info'
				);
				return 'chunk-[name]-[hash]-[format].js';
			}
		}
	}
};
