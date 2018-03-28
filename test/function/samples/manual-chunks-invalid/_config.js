module.exports = {
	description: 'manual chunks support',
	options: {
		experimentalCodeSplitting: true,
		experimentalDynamicImport: true,
		input: ['main.js'],
		manualChunks: {
			'dep1': ['dep1.js'],
			'dep2': ['dep2.js']
		}
	},
	error: {
		code: 'INVALID_CHUNK',
		message: `Cannot assign dep2.js to the "dep2" chunk as it is already in the "dep1" chunk.\nTry defining "dep2" first in the manualChunks definitions of the Rollup configuration.`
	}
};
