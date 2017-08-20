export default function deprecateOptions(options) {
	const deprecations = [];

	if ( options.targets ) {
		deprecations.push({ old: 'options.targets', new: 'options.output' });
		options.output = options.targets;
		delete options.targets;
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