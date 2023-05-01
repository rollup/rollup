let fooModule = 'foo';
let barModule = 'bar';
let barCjs = 'bar';
let fooDefault = 'foo';
let barDefault = 'bar';

module.exports = defineTest({
	description: 'handles interop "default" with live-bindings support',
	options: {
		external: id => id.startsWith('external') || id === 'update',
		output: {
			interop: 'default',
			format: 'cjs'
		}
	},
	context: {
		require(id) {
			switch (id) {
				case 'external-module': {
					return Object.defineProperty(
						{
							get default() {
								return fooModule;
							},
							get barModule() {
								return barModule;
							}
						},
						'__esModule',
						{ value: true }
					);
				}
				case 'external-cjs': {
					return {
						get barCjs() {
							return barCjs;
						}
					};
				}
				case 'external-cjs-with-default': {
					return {
						get default() {
							return fooDefault;
						},
						get barDefault() {
							return barDefault;
						}
					};
				}
				case 'update': {
					return () => {
						fooModule = 'foo2';
						barModule = 'bar2';
						barCjs = 'bar2';
						fooDefault = 'foo2';
						barDefault = 'bar2';
					};
				}
				default: {
					throw new Error(`Unexpected import "${id}"`);
				}
			}
		}
	}
});
