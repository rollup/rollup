const path = require('path');
const ID_F = path.join(__dirname, 'f.js');
const ID_G = path.join(__dirname, 'g.js');

module.exports = {
	description: 'Anonymous function declarations are hoisted',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_F, ID_G, ID_F],
			message: 'Circular dependency: f.js -> g.js -> f.js'
		}
	]
};
