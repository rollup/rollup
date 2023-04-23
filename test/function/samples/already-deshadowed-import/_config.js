const path = require('node:path');
const ID_BOB = path.join(__dirname, 'bob.js');
const ID_ALICE = path.join(__dirname, 'alice.js');

module.exports = defineTest({
	description:
		'handle already module import names correctly if they are have already been deshadowed',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_BOB, ID_ALICE, ID_BOB],
			message: 'Circular dependency: bob.js -> alice.js -> bob.js'
		}
	]
});
