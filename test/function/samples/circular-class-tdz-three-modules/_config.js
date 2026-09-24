const path = require('node:path');

const classId = path.join(__dirname, 'class.js');
const middleId = path.join(__dirname, 'middle.js');
const valueId = path.join(__dirname, 'value.js');

module.exports = defineTest({
	description:
		'orders a circular class, its constructed const, and a later const that reads that binding',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [classId, middleId, valueId, classId],
			message: 'Circular dependency: class.js -> middle.js -> value.js -> class.js'
		}
	]
});
