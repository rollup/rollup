const { loader } = require('../../../testHelpers.js');

module.exports = defineTest({
	description:
		'derives preserveModules file names from the same rules as node:path when a module id contains "." or ".." segments',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				resolveId(source) {
					if (source === 'main') return '/src/./main.js';
					if (source === './util.js') return '/src/lib/../util.js';
				}
			},
			loader({
				'/src/./main.js': `import { util } from './util.js';\nconsole.log(util);`,
				'/src/lib/../util.js': `export const util = 'util';`
			})
		],
		output: {
			preserveModules: true
		}
	}
});
