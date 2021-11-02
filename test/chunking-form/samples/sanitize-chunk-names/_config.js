module.exports = {
	description: 'sanitizes chunk names from virtual entry points',
	options: {
		input: ['main1'],
		plugins: [
			{
				options(options) {
					options.input = ['\0virtual:entry-1', '\0virtual:entry-2', 'another-[slug]-#result'];
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
};
