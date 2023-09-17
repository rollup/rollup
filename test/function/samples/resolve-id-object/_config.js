const path = require('node:path');

module.exports = defineTest({
	description: 'allows resolving an id with an object',
	options: {
		plugins: [
			{
				resolveId(importee) {
					const fooId = path.join(__dirname, 'foo.js');
					switch (importee) {
						case 'internal1': {
							return { id: fooId };
						}
						case 'internal2': {
							return { id: fooId, external: false };
						}
						case 'external': {
							return { id: 'my-external', external: true };
						}
					}
				}
			}
		]
	},
	context: {
		require(id) {
			if (id === 'my-external') {
				return 'external';
			}
			throw new Error(`Unexpected external id ${id}.`);
		}
	}
});
