const path = require('path');

module.exports = {
	description: 'normalizes both relative and absolute external paths when set to true',
	options: {
		normalizeExternalPaths: true,
		external(id) {
			if (
				[
					'./relativeUnresolved.js',
					'../relativeUnresolved.js',
					path.join(__dirname, 'relativeMissing.js'),
					path.join(__dirname, 'relativeExisting.js'),
					path.join(__dirname, 'absolute.js')
				].includes(id)
			)
				return true;
		},
		plugins: {
			resolveId(source) {
				if (source.endsWith('/pluginDirect.js')) return false;
				if (source.endsWith('/pluginTrue.js'))
					return { id: path.join(__dirname, 'pluginTrue.js'), external: true };
				if (source.endsWith('/pluginAbsolute.js'))
					return { id: '/pluginAbsolute.js', external: 'absolute' };
				if (source.endsWith('/pluginNormalize.js'))
					return { id: path.join(__dirname, 'pluginNormalize.js'), external: 'normalize' };
				if (source === '/absolute.js') return path.join(__dirname, 'absolute.js');
			}
		}
	}
};
