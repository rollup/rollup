const path = require('path');

const external1 = "quoted'\r\n\u2028\u2029external1";
const external2 = path.join(__dirname, "quoted'\r\n\u2028\u2029external2");

module.exports = {
	description: 'supports quote characters in external ids',
	options: {
		output: {
			name: 'Q',
			globals: {
				[external1]: 'quotedExternal1',
				[external2]: 'quotedExternal2'
			}
		},
		plugins: [
			{
				resolveId(id, parent) {
					if (id === 'external1') {
						return { id: external1, external: true };
					}
					if (id === 'external2') {
						return { id: external2, external: true };
					}
				}
			}
		]
	}
};
