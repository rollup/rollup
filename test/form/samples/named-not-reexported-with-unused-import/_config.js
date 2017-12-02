module.exports = {
	// testing include all functionality follows unused imports
	description: 'named export is not re-exported with unused import',
	options: {
		plugins: [{
			missingExport(module, name, otherModule) {
				otherModule.includeAllInBundleRecursive();
				return true;
			}
		}]
	}
};
