const { loader } = require('../../../testHelpers.js');
const assert = require('node:assert/strict');

const logs = [];

module.exports = defineTest({
	description: 'warns if a dependency cannot be resolved',
	options: {
		onLog(level, log) {
			logs.push({ level, log });
		},
		plugins: [
			loader({
				main: `import {foo} from 'dep';
console.log(foo);`
			}),
			{
				buildEnd() {
					assert.deepEqual(logs, [
						{
							level: 'warn',
							log: {
								code: 'UNRESOLVED_IMPORT',
								exporter: 'dep',
								id: 'main',
								message:
									'"dep" is imported by "main", but could not be resolved – treating it as an external dependency.',
								url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
							}
						}
					]);
				}
			}
		]
	}
});
