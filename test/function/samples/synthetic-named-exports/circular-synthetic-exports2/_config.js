const path = require('node:path');
const ID_DEP1 = path.join(__dirname, 'dep1.js');
const ID_DEP2 = path.join(__dirname, 'dep2.js');

module.exports = defineTest({
	description: 'handles circular synthetic exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_DEP1, ID_DEP2, ID_DEP1],
			message: 'Circular dependency: dep1.js -> dep2.js -> dep1.js'
		}
	]
});
