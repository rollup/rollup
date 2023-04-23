module.exports = defineTest({
	description: 'resolver error is not caught',
	options: {
		plugins: [
			{
				resolveId() {
					throw new Error('nope');
				},
				load(id) {
					if (id === 'main') return 'assert.ok( false );';
				}
			},
			{
				resolveId() {
					return 'main';
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'resolveId',
		message: 'nope',
		plugin: 'at position 1'
	}
});
