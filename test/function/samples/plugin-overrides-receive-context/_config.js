const assert = require('assert');

const myPlugin = {
	resolveId (id) {
		assert.equal(this.plugins[0], myPlugin);
		return id;
	}
};

module.exports = {
	description: 'plugin overrides receive context',
	options: {
		plugins: [
			myPlugin
		]
	}
};
