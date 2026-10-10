const path = require('node:path');

const baseId = path.join(__dirname, 'base.js');
const childId = path.join(__dirname, 'child.js');

module.exports = defineTest({
	description: 'initializes a base class before a circular subclass that extends it',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [baseId, childId, baseId],
			message: 'Circular dependency: base.js -> child.js -> base.js'
		}
	]
});
