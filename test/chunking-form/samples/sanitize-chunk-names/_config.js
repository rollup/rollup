module.exports = defineTest({
	description: 'sanitizes chunk names from virtual entry points',
	options: {
		input: ['main1'],
		plugins: [
			{
				options(options) {
					options.input = [
						'\0virtual:entry-1',
						'\0virtual:entry-2',
						'another-[slug]-#result',
						'foo%bar',
						'foo%20bar',
						'foo%E3%81%82bar',
						'foo%E3%81bar'
					];
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
