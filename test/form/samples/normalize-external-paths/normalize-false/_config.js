const path = require('path');

module.exports = {
	description: 'does not normalize external paths when set to false',
	options: {
		normalizeExternalPaths: false,
		external(id) {
			if (['./relativeUnresolved.js', '../relativeUnresolved.js', '/absolute.js'].includes(id))
				return true;
		},
		plugins: {
			resolveId(source) {
				if (source.endsWith('/pluginDirect.js')) return false;
				if (source.endsWith('/pluginTrue.js')) return { id: '/pluginTrue.js', external: true };
				if (source.endsWith('/pluginAbsolute.js'))
					return { id: '/pluginAbsolute.js', external: 'absolute' };
				if (source.endsWith('/pluginNormalize.js'))
					return { id: path.join(__dirname, 'pluginNormalize.js'), external: 'normalize' };
			}
		}
	}
};
