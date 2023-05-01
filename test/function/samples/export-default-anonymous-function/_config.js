const { readFileSync } = require('node:fs');
const path = require('node:path');

module.exports = defineTest({
	description: 'exports an anonymous function with custom ID resolver', // yeah, this is a real edge case
	options: {
		plugins: [
			{
				resolveId(importee) {
					return path.basename(importee).replace(/\..+/, '');
				},
				load(id) {
					return readFileSync(path.join(__dirname, id + '.js'), 'utf8');
				}
			}
		]
	}
});
