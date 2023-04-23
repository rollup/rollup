const jsx = require('acorn-jsx');

module.exports = defineTest({
	description: 'supports official acorn plugins that may rely on a shared acorn instance',
	options: {
		acornInjectPlugins: [jsx()]
	}
});
