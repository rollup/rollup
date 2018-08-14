// second argument is required because rollup's Node API
// passes inputOptions first and then output options
// unlike the config file which passes whole options in one go
import { GenericConfigObject } from './mergeOptions';

export interface Deprecation {
	old: string;
	new: string;
}

export default function deprecateOptions(
	_options: GenericConfigObject,
	_deprecateConfig: GenericConfigObject
): Deprecation[] {
	const deprecations: Deprecation[] = [];
	/*
	if (deprecateConfig.input) deprecateInputOptions();
	if (deprecateConfig.output) deprecateOutputOptions();

	return deprecations;

	function deprecateInputOptions() {
		// noop
	}

	function deprecateOutputOptions() {
		// noop
	}

	function deprecate(oldOption: string, newOption: string) {
		deprecations.push({ new: newOption, old: oldOption });
		if (!(newOption in options)) {
			options[newOption] = options[oldOption];
		}
		delete options[oldOption];
	}
	*/

	return deprecations;
}
