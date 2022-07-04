module.exports = {
	description: 'handles interop "true" without live-bindings support',
	options: {
		strictDeprecations: false,
		external: id => id.startsWith('external') || id === 'update',
		output: {
			interop: true,
			format: 'cjs',
			externalLiveBindings: false
		}
	},
	context: {
		require(id) {
			switch (id) {
				case 'external-module':
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
				case 'external-cjs':
					return {
						get barCjs() {
							return 'bar';
						}
					};
				case 'external-cjs-with-default':
					return {
						get default() {
							return 'foo';
						},
						get barDefault() {
							return 'bar';
						}
					};
				default:
					throw new Error(`Unexpected import "${id}"`);
			}
		}
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The boolean value "true" for the "output.interop" option is deprecated. Use "auto" instead.',
			url: 'https://rollupjs.org/guide/en/#outputinterop'
		}
	]
};
