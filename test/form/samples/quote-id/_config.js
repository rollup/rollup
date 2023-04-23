const path = require('node:path');

const external1 = "quoted'\r\n\u2028\u2029external1";
const external2 = path.join(__dirname, "quoted'\r\n\u2028\u2029external2");
const external3 = 'C:\\File\\Path.js';

module.exports = defineTest({
	description: 'handles escaping for external ids',
	options: {
		output: {
			paths: id => {
				if (id === external3) return id;
				return path.relative(__dirname, id);
			},
			name: 'Q',
			globals: {
				[external1]: 'quotedExternal1',
				[external2]: 'quotedExternal2',
				[external3]: 'quotedExternal3'
			}
		},
		plugins: [
			{
				resolveId(id) {
					if (id === 'external1') {
						return { id: external1, external: true };
					}
					if (id === 'external2') {
						return { id: external2, external: true };
					}
					if (id === 'external3') {
						return { id: external3, external: true };
					}
				}
			}
		]
	}
});
