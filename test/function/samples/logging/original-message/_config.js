const assert = require('node:assert');

module.exports = defineTest({
	description: 'augmented log preserves original message in originalMessage property',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.warn({ message: 'original text' });
				}
			}
		]
	},
	logs: [
		{
			level: 'warn',
			message: '[plugin test] original text',
			originalMessage: 'original text',
			code: 'PLUGIN_WARNING',
			plugin: 'test'
		}
	]
});
