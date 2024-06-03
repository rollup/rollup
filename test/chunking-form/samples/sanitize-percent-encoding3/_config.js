module.exports = defineTest({
	description: 'make sure illegal percent encoding is sanitized for virtual entry points',
	options: {
		input: ['main'],
		plugins: [
			{
				options(options) {
					options.input = ['foo%bar', 'foo%20bar', 'foo%E3%81%82bar', 'foo%E3%81bar'];
					return options;
				},
				resolveId(id) {
					return id;
				},
				load(id) {
					return 'export default ' + JSON.stringify(id);
				}
			}
		]
	}
});
