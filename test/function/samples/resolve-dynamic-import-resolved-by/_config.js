const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'sets resolvedBy to the plugin that resolved a dynamic import',
	options: {
		plugins: [
			{
				name: 'test',
				resolveDynamicImport(specifier) {
					switch (specifier) {
						case './object.js': {
							return { id: path.join(__dirname, 'object.js') };
						}
						case './string.js': {
							return path.join(__dirname, 'string.js');
						}
						case './excluded.js': {
							return false;
						}
						case './custom.js': {
							return { id: path.join(__dirname, 'custom.js'), resolvedBy: 'custom' };
						}
					}
					if (typeof specifier !== 'string') {
						return { id: path.join(__dirname, 'expression.js') };
					}
				},
				buildEnd() {
					assert.deepEqual(
						this.getModuleInfo(ID_MAIN).dynamicallyImportedIdResolutions.map(
							({ resolvedBy }) => resolvedBy
						),
						['test', 'test', 'rollup', 'custom', 'test', 'rollup']
					);
				}
			}
		]
	}
});
