console.log('This is the output when a missing export is used internally but not reexported');

function almostUseUnused(useIt) {
	if (useIt) {
		console.log(useIt);
		console.log(_missingExportShim);
	}
}

almostUseUnused(true);
