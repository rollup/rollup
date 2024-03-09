const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const logs = [];

module.exports = defineTest({
	description: 'allows plugins to read and filter logs',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'first',
				buildStart() {
					this.info('passed to both plugins');
				},
				onLog(level, log) {
					logs.push(['first', level, log]);
					if (log.code === 'EVAL') {
						return false;
					}
					if (log.code === 'UNRESOLVED_IMPORT') {
						if (level !== 'warn') {
							throw new Error(
								'UNRESOLVED_IMPORT log should not be passed back to the first plugin'
							);
						}
						// This should not be passed back to the first plugin as we are
						// logging from the onLog hook
						return this.info(log);
					}
				}
			},
			{
				name: 'second',
				onLog(level, log) {
					logs.push(['second', level, log]);
					if (log.code === 'EVAL') {
						throw new Error('EVAL log should not be passed to second plugin');
					}
					if (log.code === 'UNRESOLVED_IMPORT') {
						if (level === 'debug') {
							throw new Error(
								'UNRESOLVED_IMPORT log should not be passed back to the second plugin'
							);
						}
						// As we do not filter, the original warn log should also be passed
						// to the second plugin
						if (level !== 'warn') {
							// This should not be passed to either the first or second plugin
							// as we are handling a log from the onLog hook of the first
							// plugin in the onLog hook of the second plugin
							return this.debug(log);
						}
					}
				}
			}
		]
	},
	after() {
		assert.deepEqual(logs, [
			[
				'first',
				'info',
				{ message: '[plugin first] passed to both plugins', code: 'PLUGIN_LOG', plugin: 'first' }
			],
			[
				'second',
				'info',
				{ message: '[plugin first] passed to both plugins', code: 'PLUGIN_LOG', plugin: 'first' }
			],
			[
				'first',
				'warn',
				{
					code: 'THIS_IS_UNDEFINED',
					message:
						"main.js (2:5): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
					url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined',
					id: ID_MAIN,
					pos: 24,
					loc: {
						column: 5,
						file: ID_MAIN,
						line: 2
					},
					frame: "1: import 'external';\n2: eval(this);\n        ^"
				}
			],
			[
				'second',
				'warn',
				{
					code: 'THIS_IS_UNDEFINED',
					message:
						"main.js (2:5): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
					url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined',
					id: ID_MAIN,
					pos: 24,
					loc: {
						column: 5,
						file: ID_MAIN,
						line: 2
					},
					frame: "1: import 'external';\n2: eval(this);\n        ^"
				}
			],
			[
				'first',
				'warn',
				{
					code: 'UNRESOLVED_IMPORT',
					exporter: 'external',
					id: ID_MAIN,
					message:
						'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
					url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
				}
			],
			[
				'second',
				'info',
				{
					code: 'UNRESOLVED_IMPORT',
					exporter: 'external',
					id: ID_MAIN,
					message:
						'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
					url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
				}
			],
			[
				'second',
				'warn',
				{
					code: 'UNRESOLVED_IMPORT',
					exporter: 'external',
					id: ID_MAIN,
					message:
						'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
					url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
				}
			],
			[
				'first',
				'warn',
				{
					code: 'EVAL',
					id: ID_MAIN,
					message:
						'main.js (2:0): Use of eval in "main.js" is strongly discouraged as it poses security risks and may cause issues with minification.',
					url: 'https://rollupjs.org/troubleshooting/#avoiding-eval',
					pos: 19,
					loc: {
						column: 0,
						file: ID_MAIN,
						line: 2
					},
					frame: "1: import 'external';\n2: eval(this);\n   ^"
				}
			]
		]);
	},
	logs: [
		{
			level: 'debug',
			code: 'UNRESOLVED_IMPORT',
			exporter: 'external',
			id: ID_MAIN,
			message:
				'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
		},
		{
			level: 'info',
			code: 'UNRESOLVED_IMPORT',
			exporter: 'external',
			id: ID_MAIN,
			message:
				'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
		},
		{
			level: 'warn',
			code: 'UNRESOLVED_IMPORT',
			exporter: 'external',
			id: ID_MAIN,
			message:
				'"external" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
			url: 'https://rollupjs.org/troubleshooting/#warning-treating-module-as-external-dependency'
		},
		{
			level: 'warn',
			code: 'THIS_IS_UNDEFINED',
			message:
				"main.js (2:5): The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
			url: 'https://rollupjs.org/troubleshooting/#error-this-is-undefined',
			id: ID_MAIN,
			pos: 24,
			loc: {
				column: 5,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: import 'external';
				2: eval(this);
				        ^`
		},
		{
			level: 'info',
			message: '[plugin first] passed to both plugins',
			code: 'PLUGIN_LOG',
			plugin: 'first'
		}
	]
});
