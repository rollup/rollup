module.exports = defineTest({
	description: 'Preserve modules id case sensitive',
	options: {
		input: 'main.js',
		output: { preserveModules: true },
		plugins: [
			{
				resolveId(id) {
					if (id.toLowerCase().includes('one')) {
						return id;
					}
				},
				load(id) {
					if (id.toLowerCase().includes('one')) {
						return `export default '${id.replace('\0', '')}'`;
					}
				}
			}
		]
	}
});
