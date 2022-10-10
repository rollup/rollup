const plugin = [
	{
		name: 'nested-plugin-1',
		transform(code) {
			return code.replace('foo = 1', 'foo = 2');
		}
	},
	{
		name: 'nested-plugin-2',
		transform(code) {
			return code.replace('answer = 41', 'answer = 42');
		}
	}
];

module.exports = {
	description: 'works when nested plugin',
	options: {
		plugins: [plugin]
	}
};
