export default function deprecateOptions(options) {
	const deprecations = [];

	if ( options.entry ) {
		deprecations.push({ old: 'options.entry', new: 'options.input' });
		options.input = options.entry; // don't delete, as plugins sometimes depend on this...
	}

	if ( options.moduleName ) {
		deprecations.push({ old: 'options.moduleName', new: 'options.name' });
		options.name = options.moduleName;
		delete options.moduleName;
	}

	if ( options.sourceMap ) {
		deprecations.push({ old: 'options.sourceMap', new: 'options.sourcemap' });
		options.sourcemap = options.sourceMap;
		delete options.sourceMap;
	}

	if ( options.sourceMapFile ) {
		deprecations.push({ old: 'options.sourceMapFile', new: 'options.sourcemapFile' });
		options.sourcemapFile = options.sourceMapFile;
		delete options.sourceMapFile;
	}

	if ( options.useStrict ) {
		deprecations.push({ old: 'options.useStrict', new: 'options.strict' });
		options.strict = options.useStrict;
		delete options.useStrict;
	}

	if ( options.targets ) {
		deprecations.push({ old: 'options.targets', new: 'options.output' });
		options.output = options.targets;
		delete options.targets;

		let deprecatedDest = false;
		options.output.forEach(output => {
			if (output.dest) {
				if (!deprecatedDest) {
					deprecations.push({ old: 'output.dest', new: 'output.file' });
					deprecatedDest = true;
				}
				output.file = output.dest;
				delete output.dest;
			}
		});
	} else if ( options.dest ) {
		deprecations.push({ old: 'options.dest', new: 'options.output.file' });
		options.output = {
			file: options.dest,
			format: options.format
		};
		delete options.dest;
	}

	if ( options.format ) {
		if ( !options.output ) options.output = { format: options.format };
		deprecations.push({ old: 'options.format', new: 'options.output.format' });
		delete options.format;
	}

	return deprecations;
}