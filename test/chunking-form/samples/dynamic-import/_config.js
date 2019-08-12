module.exports = {
	description: 'handles dynamic imports with a shared dependency',
	options: {
		input: ['main'],
		output: {
			chunkFileNames: 'chunks/[name].js'
		}
	},
	runAmd: {
		exports(exports) {
			return exports.promise;
		}
	}
};
