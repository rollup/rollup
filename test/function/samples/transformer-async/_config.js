module.exports = defineTest({
	description: 'transformers can be asynchronous',
	options: {
		plugins: [
			{
				transform(code) {
					return Promise.resolve(code.replace('x', 1));
				}
			},
			{
				transform(code) {
					return code.replace('1', 2);
				}
			},
			{
				transform(code) {
					return Promise.resolve(code.replace('2', 3));
				}
			}
		]
	}
});
