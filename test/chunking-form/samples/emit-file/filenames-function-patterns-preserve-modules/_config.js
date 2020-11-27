const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEB = path.join(__dirname, 'deb.js');

module.exports = {
	description:
		'supports using a function that returns a pattern for entryFileNames, with output.preserveModules option',
	options: {
		input: ['main.js'],
		plugins: {
			transform() {
				this.emitFile({ type: 'asset', name: 'test.txt', source: 'hello world' });
				return null;
			}
		},
		output: {
			preserveModules: true,
			entryFileNames: fileInfo => {
				const isMain = fileInfo.facadeModuleId === ID_MAIN;

				// This is checked separately as deepStrictEqual is having some issues
				assert.deepStrictEqual(Object.keys(fileInfo.modules), [isMain ? ID_MAIN : ID_DEB]);

				delete fileInfo.modules;
				assert.deepStrictEqual(
					fileInfo,
					{
						exports: isMain ? [] : ['default'],
						facadeModuleId: isMain ? ID_MAIN : ID_DEB,
						isDynamicEntry: !isMain,
						isEntry: isMain,
						isImplicitEntry: false,
						name: isMain ? 'main' : 'deb',
						type: 'chunk'
					},
					'entry info'
				);

				return `entry-[name]-[format].js`;
			}
		}
	}
};
