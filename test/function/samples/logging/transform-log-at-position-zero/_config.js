const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'includes source locations for transform logs at position zero',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'test',
				transform() {
					this.warn('warn-message', 0);
					this.info('info-message', 0);
					this.debug('debug-message', 0);
				}
			}
		]
	},
	logs: ['warn', 'info', 'debug'].map(level => ({
		code: level === 'warn' ? 'PLUGIN_WARNING' : 'PLUGIN_LOG',
		frame: `
			1: assert.ok(true);
			   ^`,
		hook: 'transform',
		id: ID_MAIN,
		level,
		loc: {
			column: 0,
			file: ID_MAIN,
			line: 1
		},
		message: `[plugin test] main.js (1:0): ${level}-message`,
		plugin: 'test',
		pos: 0
	}))
});
