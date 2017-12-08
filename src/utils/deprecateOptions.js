// second argument is required because rollup's Node API
// passes inputOptions first and then output options
// unlike the config file which passes whole options in one go
export default function deprecateOptions ( options, deprecateConfig ) {
	const deprecations = [];

	if (deprecateConfig.input) deprecateInputOptions();
	if (deprecateConfig.output) deprecateOutputOptions();

	return deprecations;

	function deprecateInputOptions () {
		if (options.entry)	deprecate('entry', 'input');
		if (options.moduleName)	deprecate('moduleName', 'output.name', true);
		if (options.extend)	deprecate('extend', 'output.extend', true);
		if (options.globals)	deprecate('globals', 'output.globals', true);
		if (options.indent)	deprecate('indent', 'output.indent', true);
		if (options.noConflict)	deprecate('noConflict', 'output.noConflict', true);
		if (options.paths)	deprecate('paths', 'output.paths', true);
		if (options.sourcemap)	deprecate('sourcemap', 'output.sourcemap', true);
		if (options.sourceMap) deprecate('sourceMap', 'output.sourcemap', true);
		if (options.sourceMapFile) deprecate('sourceMapFile', 'output.sourcemapFile', true);
		if (options.useStrict) deprecate('useStrict', 'output.strict', true);
		if (options.format)	deprecate('format', 'output.format', true);
	
		if ( options.targets ) {
			deprecations.push( { old: 'targets', new: 'output' } );

			// as targets is an array and we need to merge other output options
			// like sourcemap etc.
			options.output = options.targets.map(t => Object.assign({}, t, options.output));
			delete options.targets;
			
			let deprecatedDest = false;
			options.output.forEach( output => {
				if ( output.dest ) {
					if ( !deprecatedDest ) {
						deprecations.push( { old: 'targets.dest', new: 'output.file' } );
						deprecatedDest = true;
					}
					output.file = output.dest;
					delete output.dest;
				}
			} );
		} else if ( options.dest ) {
			deprecations.push( { old: 'dest', new: 'output.file' } );
			options.output = {
				file: options.dest,
				format: options.format
			};
			delete options.dest;
		}
	
		if ( options.pureExternalModules ) {
			deprecations.push( { old: 'pureExternalModules', new: 'treeshake.pureExternalModules' } );
			if ( options.treeshake === undefined ) {
				options.treeshake = {};
			}
			if ( options.treeshake ) {
				options.treeshake.pureExternalModules = options.pureExternalModules;
			}
			delete options.pureExternalModules;
		}
	}

	function deprecateOutputOptions () {
		if (options.output && options.output.moduleId) {
			options.output.amd = { id: options.moduleId };
			deprecations.push( { old: 'moduleId', new: 'amd' } );
			delete options.output.moduleId;
		}
	}

	// a utility function to add deprecations for straightforward options
	function deprecate (oldOption, newOption, shouldDelete) {
		deprecations.push({ new: newOption, old: oldOption });

		if (newOption.indexOf('output') > -1) {
			options.output = options.output || {};
			options.output[newOption.replace(/output\./, '')] = options[oldOption];
		} else {
			options[newOption] = options[oldOption];
		}

		if (shouldDelete) delete options[oldOption];
	}
}
