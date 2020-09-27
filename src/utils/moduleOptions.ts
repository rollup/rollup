import Module from '../Module';
import { ModuleOptions, PartialNull } from '../rollup/types';

export function updateModuleOptions(
	module: Module,
	{ meta, moduleSideEffects, syntheticNamedExports }: Partial<PartialNull<ModuleOptions>>
) {
	if (moduleSideEffects != null) {
		module.moduleSideEffects = moduleSideEffects;
	}
	if (syntheticNamedExports != null) {
		module.syntheticNamedExports = syntheticNamedExports;
	}
	if (meta != null) {
		module.custom = { ...module.custom, ...meta };
	}
}
