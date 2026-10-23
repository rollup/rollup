const path = require('node:path');

module.exports = defineTest({
	description: 'uses the decoded value of JSX string attributes in classic mode',
	options: {
		jsx: {
			factory: 'h',
			importSource: path.join(__dirname, 'h.js'),
			mode: 'classic'
		}
	}
});
