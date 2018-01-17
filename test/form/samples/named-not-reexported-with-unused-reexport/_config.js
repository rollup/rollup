module.exports = {
	// testing include all functionality follows unused reexport
	description: 'named export is not re-exported with unused reexport',
	options: {
		plugins: [{
			missingExport(module, name, otherModule) {
				otherModule.includeAllInBundleRecursive();
				return true;
			}
		}]
	}
};
