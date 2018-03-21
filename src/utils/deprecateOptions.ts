// second argument is required because rollup's Node API
// passes inputOptions first and then output options
// unlike the config file which passes whole options in one go
import { GenericConfigObject } from './mergeOptions';

export type Deprecation = { old: string; new: string };

export default function deprecateOptions(
	options: GenericConfigObject,
	deprecateConfig: GenericConfigObject
): Deprecation[] {
	const deprecations: Deprecation[] = [];
	if (deprecateConfig.input) deprecateInputOptions();
	if (deprecateConfig.output) deprecateOutputOptions();

	return deprecations;

	function deprecateInputOptions() {
		if (!options.input && options.entry) deprecate('entry', 'input');
		if (options.dest) deprecate('dest', 'output.file');
		if (options.moduleName) deprecate('moduleName', 'output.name');
		if (options.name) deprecate('name', 'output.name');
		if (options.extend) deprecate('extend', 'output.extend');
		if (options.globals) deprecate('globals', 'output.globals');
		if (options.indent) deprecate('indent', 'output.indent');
		if (options.noConflict) deprecate('noConflict', 'output.noConflict');
		if (options.paths) deprecate('paths', 'output.paths');
		if (options.sourcemap) deprecate('sourcemap', 'output.sourcemap');
		if (options.sourceMap) deprecate('sourceMap', 'output.sourcemap');
		if (options.sourceMapFile) deprecate('sourceMapFile', 'output.sourcemapFile');
		if (options.useStrict) deprecate('useStrict', 'output.strict');
		if (options.strict) deprecate('strict', 'output.strict');
		if (options.format) deprecate('format', 'output.format');
		if (options.banner) deprecate('banner', 'output.banner');
		if (options.footer) deprecate('footer', 'output.footer');
		if (options.intro) deprecate('intro', 'output.intro');
		if (options.outro) deprecate('outro', 'output.outro');
		if (options.interop) deprecate('interop', 'output.interop');
		if (options.freeze) deprecate('freeze', 'output.freeze');
		if (options.exports) deprecate('exports', 'output.exports');

		if (options.targets) {
			deprecations.push({ old: 'targets', new: 'output' });

			// as targets is an array and we need to merge other output options
			// like sourcemap etc.
			options.output = options.targets.map((target: GenericConfigObject) =>
				Object.assign({}, target, options.output)
			);
			delete options.targets;

			let deprecatedDest = false;
			options.output.forEach((outputEntry: GenericConfigObject) => {
				if (outputEntry.dest) {
					if (!deprecatedDest) {
						deprecations.push({ old: 'targets.dest', new: 'output.file' });
						deprecatedDest = true;
					}
					outputEntry.file = outputEntry.dest;
					delete outputEntry.dest;
				}
			});
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
	}

	function deprecateOutputOptions() {
		if (options.output && options.output.moduleId) {
			options.output.amd = { id: options.moduleId };
			deprecations.push({ old: 'moduleId', new: 'amd' });
			delete options.output.moduleId;
		}
	}

	// a utility function to add deprecations for straightforward options
	function deprecate(oldOption: string, newOption: string) {
		deprecations.push({ new: newOption, old: oldOption });

		if (newOption.indexOf('output') > -1) {
			options.output = options.output || {};
			options.output[newOption.replace(/output\./, '')] = options[oldOption];
		} else {
			options[newOption] = options[oldOption];
		}

		delete options[oldOption];
	}
}
