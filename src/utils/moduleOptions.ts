import Module from '../Module';
import { ModuleOptions, PartialNull } from '../rollup/types';

// TODO Lukas put into module and make properties private?
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
		module.meta = { ...module.meta, ...meta };
	}
}
