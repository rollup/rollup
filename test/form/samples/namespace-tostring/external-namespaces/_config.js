module.exports = defineTest({
	description: 'adds Symbol.toStringTag property to external namespaces',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			generatedCode: { symbols: true },
			globals: {
				'external-auto': 'externalAuto',
				'external-default': 'externalDefault',
				'external-defaultOnly': 'externalDefaultOnly'
			},
			interop(id) {
				switch (id) {
					case 'external-auto': {
						return 'auto';
					}
					case 'external-default': {
						return 'default';
					}
					case 'external-defaultOnly': {
						return 'defaultOnly';
					}
					default: {
						throw new Error(`Unexpected require "${id}"`);
					}
				}
			}
		}
	}
});
