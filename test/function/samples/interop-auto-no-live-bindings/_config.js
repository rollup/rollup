module.exports = defineTest({
	description: 'handles interop "auto" without live-bindings support',
	options: {
		external: id => id.startsWith('external') || id === 'update',
		output: {
			interop: 'auto',
			format: 'cjs',
			externalLiveBindings: false
		}
	},
	context: {
		require(id) {
			switch (id) {
				case 'external-module': {
					return Object.defineProperty(
						{
							get default() {
								return 'foo';
							},
							get barModule() {
								return 'bar';
							}
						},
						'__esModule',
						{ value: true }
					);
				}
				case 'external-cjs': {
					return {
						get barCjs() {
							return 'bar';
						}
					};
				}
				case 'external-cjs-with-default': {
					return {
						get default() {
							return 'foo';
						},
						get barDefault() {
							return 'bar';
						}
					};
				}
				default: {
					throw new Error(`Unexpected import "${id}"`);
				}
			}
		}
	}
});
