module.exports = defineTest({
	description:
		'skipSelf: true option in resolveId hook option should skip the plugin if it has been called before with the same id and importer, see #5768 for more details',
	options: {
		plugins: [
			{
				name: 'r1',
				async resolveId(id) {
					const importer = 'foo';
					return (await this.resolve(id, importer)) ?? 'success';
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
					const importer = 'bar';
					return this.resolve(id, importer);
				}
			}
		]
	}
});
