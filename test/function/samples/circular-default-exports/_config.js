const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'handles circular default exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_MAIN],
			message: 'Circular dependency: main.js -> main.js'
		}
	]
};
