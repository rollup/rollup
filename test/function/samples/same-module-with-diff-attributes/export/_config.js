module.exports = defineTest({
	description: 'supporting export same module with different attributes',
	options: {
		plugins: [
			{
				resolveId(id) {
					if (id.includes('other')) return id;
				},
				load(id) {
					if (id.endsWith('./other?attributes=%7B%22type%22%3A%22type1%22%7D'))
						return 'export const other1 = 1';
					if (id.endsWith('./other?attributes=%7B%22type%22%3A%22type2%22%7D'))
						return 'export const other2 = 2';
				}
			}
		]
	}
});
