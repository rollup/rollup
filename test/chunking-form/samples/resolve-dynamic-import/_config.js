const path = require('node:path');
const EXISTING = path.resolve(__dirname, 'existing.js');

module.exports = defineTest({
	description: 'Supports all resolution formats for dynamic imports',
	options: {
		plugins: {
			resolveId(source) {
				switch (source) {
					case 'existing-name': {
						return EXISTING;
					}
					case './direct-relative-external': {
						return false;
					}
					case './indirect-relative-external': {
						return {
							id: 'to-indirect-relative-external',
							external: true
						};
					}
					case 'direct-absolute-external': {
						return false;
					}
					case 'indirect-absolute-external': {
						return {
							id: 'to-indirect-absolute-external',
							external: true
						};
					}
				}
			},

			resolveDynamicImport(specifier) {
				if (typeof specifier === 'string') {
					switch (specifier) {
						case 'existing-name': {
							return EXISTING;
						}
						case './direct-relative-external':
						case '../direct-relative-external': {
							return false;
						}
						case './indirect-relative-external':
						case '../indirect-relative-external': {
							return {
								id: 'to-indirect-relative-external',
								external: true
							};
						}
						case 'direct-absolute-external': {
							return false;
						}
						case 'indirect-absolute-external': {
							return {
								id: 'to-indirect-absolute-external',
								external: true
							};
						}
						default: {
							throw new Error(`Unexpected import ${specifier}`);
						}
					}
				}
				switch (specifier.left.value) {
					case 'dynamic-direct-external': {
						return false;
					}
					case 'dynamic-indirect-external': {
						return {
							id: 'to-dynamic-indirect-external',
							external: true
						};
					}
					case 'dynamic-indirect-existing': {
						return {
							id: EXISTING,
							external: false
						};
					}
					case 'dynamic-replaced': {
						return `'my' + 'replacement'`;
					}
					default: {
						throw new Error(`Unexpected import ${specifier.left.value}`);
					}
				}
			}
		}
	}
});
