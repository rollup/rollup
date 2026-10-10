const path = require('node:path');

const classId = path.join(__dirname, 'class.js');
const valueId = path.join(__dirname, 'value.js');

module.exports = defineTest({
	description:
		'does not reorder a cycle when an imported binding is only read by a class instance field',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [valueId, classId, valueId],
			message: 'Circular dependency: value.js -> class.js -> value.js'
		}
	]
});
