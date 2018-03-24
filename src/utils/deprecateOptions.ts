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
		if (options.dest) deprecateToOutputOption('dest', 'file');
		if (options.moduleName) deprecateToOutputOption('moduleName', 'name');
		if (options.name) deprecateToOutputOption('name', 'name');
		if (options.extend) deprecateToOutputOption('extend', 'extend');
		if (options.globals) deprecateToOutputOption('globals', 'globals');
		if (options.indent) deprecateToOutputOption('indent', 'indent');
		if (options.noConflict) deprecateToOutputOption('noConflict', 'noConflict');
		if (options.paths) deprecateToOutputOption('paths', 'paths');
		if (options.sourcemap) deprecateToOutputOption('sourcemap', 'sourcemap');
		if (options.sourceMap) deprecateToOutputOption('sourceMap', 'sourcemap');
		if (options.sourceMapFile) deprecateToOutputOption('sourceMapFile', 'sourcemapFile');
		if (options.useStrict) deprecateToOutputOption('useStrict', 'strict');
		if (options.strict) deprecateToOutputOption('strict', 'strict');
		if (options.format) deprecateToOutputOption('format', 'format');
		if (options.banner) deprecateToOutputOption('banner', 'banner');
		if (options.footer) deprecateToOutputOption('footer', 'footer');
		if (options.intro) deprecateToOutputOption('intro', 'intro');
		if (options.outro) deprecateToOutputOption('outro', 'outro');
		if (options.interop) deprecateToOutputOption('interop', 'interop');
		if (options.freeze) deprecateToOutputOption('freeze', 'freeze');
		if (options.exports) deprecateToOutputOption('exports', 'exports');

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

	function deprecate(oldOption: string, newOption: string) {
		deprecations.push({ new: newOption, old: oldOption });
		if (!(newOption in options)) {
			options[newOption] = options[oldOption];
		}
		delete options[oldOption];
	}

	function deprecateToOutputOption(oldOption: string, newOption: string) {
		deprecations.push({ new: `output.${newOption}`, old: oldOption });
		options.output = options.output || {};
		if (!(newOption in options.output)) {
			options.output[newOption] = options[oldOption];
		}
		delete options[oldOption];
	}
}
