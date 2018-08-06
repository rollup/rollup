module.exports = {
	description: 'bundle transformers can be asynchronous',
	options: {
		plugins: [
			{
				transformBundle(code) {
					return Promise.resolve(code.replace('x', 1));
				}
			},
			{
				transformBundle(code) {
					return code.replace('1', 2);
				}
			},
			{
				transformBundle(code) {
					return Promise.resolve(code.replace('2', 3));
				}
			}
		]
	}
};
