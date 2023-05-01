const path = require('node:path');

module.exports = defineTest({
	description: 'non .js extensions are preserved',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (path.extname(id) === '.json') {
						return 'export default ' + code;
					}
				}
			}
		]
	}
});
