const jsx = require('acorn-jsx');

module.exports = defineRollupTest({
	description: 'supports official acorn plugins that may rely on a shared acorn instance',
	options: {
		acornInjectPlugins: [jsx()]
	}
});
