const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
	description: 'exports an anonymous function with custom ID resolver', // yeah, this is a real edge case
	options: {
		plugins: [
			{
				resolveId(importee) {
					return path.basename(importee).replace(/\..+/, '');
				},
				load(id) {
					return readFileSync(path.join(__dirname, id + '.js'), 'utf-8');
				}
			}
		]
	}
};
