const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'does not allow returning attributes from the "load" hook',
	options: {
		plugins: [
			{
				resolveId(source) {
					if (source.endsWith('.json')) {
						return {
							id: source
						};
					}
				},
				load(id) {
					if (id.includes('.json')) {
						return {
							code: 'export default {a:1}',
							attributes: {}
						};
					}
				}
			}
		]
	},
	error: {
		code: 'DEPRECATED_FEATURE',
		message:
			'Could not load ./foo.json?attributes=%7B%22type%22%3A%22json%22%7D (imported by main.js): Returning attributes from the "load" hook is forbidden.',
		url: 'https://rollupjs.org/plugin-development/#load',
		watchFiles: [ID_MAIN]
	}
});
