export default function deprecateOptions (options: any) {
	const deprecations: { old: string, new: string }[] = [];

	if (options.entry) {
		deprecations.push({ old: 'entry', new: 'input' });
		options.input = options.entry; // don't delete, as plugins sometimes depend on this...
	}

	if (options.moduleName) {
		deprecations.push({ old: 'moduleName', new: 'output.name' });
		options.name = options.moduleName;
		delete options.moduleName;
	}

	if (options.sourceMap) {
		deprecations.push({ old: 'sourceMap', new: 'output.sourcemap' });
		options.sourcemap = options.sourceMap;
		delete options.sourceMap;
	}

	if (options.sourceMapFile) {
		deprecations.push({ old: 'sourceMapFile', new: 'output.sourcemapFile' });
		options.sourcemapFile = options.sourceMapFile;
		delete options.sourceMapFile;
	}

	if (options.useStrict) {
		deprecations.push({ old: 'useStrict', new: 'output.strict' });
		options.strict = options.useStrict;
		delete options.useStrict;
	}

	if (options.targets) {
		deprecations.push({ old: 'targets', new: 'output' });
		options.output = options.targets;
		delete options.targets;

		let deprecatedDest = false;
		options.output.forEach((output: { dest?: string, file: string }) => {
			if (output.dest) {
				if (!deprecatedDest) {
					deprecations.push({ old: 'targets.dest', new: 'output.file' });
					deprecatedDest = true;
				}
				output.file = output.dest;
				delete output.dest;
			}
		});
	} else if (options.dest) {
		deprecations.push({ old: 'dest', new: 'output.file' });
		options.output = {
			file: options.dest,
			format: options.format
		};
		delete options.dest;
	}

	if (options.format) {
		if (!options.output) options.output = { format: options.format };
		deprecations.push({ old: 'format', new: 'output.format' });
		delete options.format;
	}

	if (options.pureExternalModules) {
		deprecations.push({
			old: 'pureExternalModules',
			new: 'treeshake.pureExternalModules'
		});
		if (options.treeshake === undefined) {
			options.treeshake = {};
		}
		if (options.treeshake) {
			options.treeshake.pureExternalModules = options.pureExternalModules;
		}
		delete options.pureExternalModules;
	}

	return deprecations;
}
