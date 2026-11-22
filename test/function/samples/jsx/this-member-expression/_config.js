const path = require('node:path');

module.exports = defineTest({
	description: 'keeps `this` as the object of JSX member expressions inside functions',
	options: {
		jsx: {
			factory: 'h',
			importSource: path.join(__dirname, 'h.js'),
			mode: 'classic'
		}
	}
});
