module.exports = {
	description: 'allows global names to be specified for IIFE/UMD exports',
	options: {
		external: [ 'jquery' ],
		globals: {
			jquery: 'jQuery'
		}
	}
};
