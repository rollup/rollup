module.exports = defineTest({
	description:
		'skipSelf: true option in resolveId hook option should skip the plugin if it has been called before with the same id and importer, see #5768 for more details',
	options: {
		plugins: [
			{
				name: 'r1',
				resolveId(id) {
					console.log('r1', id);
					const importer = 'foo';
					return this.resolve(id, importer) ?? 'success';
				},
				load(id) {
					if (id === 'success') {
						return { code: 'export default 1' };
					}
				}
			},
			{
				name: 'r2',
				resolveId(id) {
					console.log('r2', id);
					const importer = 'bar';
					return this.resolve(id, importer);
				}
			}
		]
	}
});
