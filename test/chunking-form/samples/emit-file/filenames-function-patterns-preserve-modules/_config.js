const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEB = path.join(__dirname, 'deb.js');

module.exports = defineTest({
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
				if (fileInfo.facadeModuleId === ID_MAIN) {
					assert.deepStrictEqual(
						fileInfo,
						{
							exports: [],
							facadeModuleId: ID_MAIN,
							isDynamicEntry: false,
							isEntry: true,
							isImplicitEntry: false,
							moduleIds: [ID_MAIN],
							name: 'main',
							type: 'chunk'
						},
						'entry info'
					);
				} else {
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
						'entry info'
					);
				}
				return `entry-[name]-[format].js`;
			}
		}
	}
});
