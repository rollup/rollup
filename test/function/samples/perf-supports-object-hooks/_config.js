module.exports = defineTest({
	description: 'Supports object hooks with perf=true',
	options: {
		perf: true,
		plugins: [
			{
				transform: {
					order: 'pre',
					handler(code) {
						return code.replace('FOO', 'BAR');
					}
				}
			}
		]
	}
});
