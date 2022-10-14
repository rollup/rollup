const pluginA = {
	name: 'nested-plugin-1',
	options(options) {
		options.plugins.push(pluginB);
	},
	transform(code) {
		return code.replace('foo = 1', 'foo = 2');
	}
};

const pluginB = {
	name: 'nested-plugin-2',
	transform(code) {
		return code.replace('answer = 41', 'answer = 42');
	}
};

module.exports = {
	description: 'works when nested plugin',
	options: {
		// eslint-disable-next-line no-sparse-arrays
		plugins: [[pluginA], [undefined, [null]], ,]
	}
};
