module.exports = defineTest({
	description: 'supporting export same module with different attributes',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id.includes('other')) return id;
				},
				load(id) {
					if (id.endsWith('./other?type=type1')) return 'export const other1 = 1';
					if (id.endsWith('./other?type=type2')) return 'export const other2 = 2';
				}
			}
		]
	}
});
