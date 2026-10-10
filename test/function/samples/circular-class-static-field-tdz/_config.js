const path = require('node:path');

const classId = path.join(__dirname, 'class.js');
const valueId = path.join(__dirname, 'value.js');

module.exports = defineTest({
	description:
		'initializes a circular const before a class static field that reads it',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [valueId, classId, valueId],
			message: 'Circular dependency: value.js -> class.js -> value.js'
		}
	]
});
