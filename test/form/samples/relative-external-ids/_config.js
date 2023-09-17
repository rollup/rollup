const path = require('node:path');

module.exports = defineTest({
	description: 'relative external ids are absolutely resolved',
	options: {
		external(id) {
			switch (id) {
				case './optionDirect.js': {
					return true;
				}
				case './optionDirectNested.js': {
					return true;
				}
				case path.resolve(__dirname, 'optionIndirect.js'): {
					return true;
				}
				case path.resolve(__dirname, 'nested', 'optionIndirectNested.js'): {
					return true;
				}
				default: {
					return false;
				}
			}
		},
		plugins: [
			{
				resolveId(id) {
					switch (id) {
						case './hook.js': {
							return false;
						}
						case './hookNested.js': {
							return false;
						}
						case 'resolved': {
							return { id: './resolved.js', external: true };
						}
						case 'resolvedNested': {
							return { id: './resolvedNested.js', external: true };
						}
						default: {
							return null;
						}
					}
				}
			}
		]
	}
});
