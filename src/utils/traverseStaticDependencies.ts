import ExternalModule from '../ExternalModule';
import type Module from '../Module';

export function markModuleAndImpureDependenciesAsExecuted(baseModule: Module): void {
	baseModule.isExecuted = true;
	const modules = [baseModule];
	const visitedModules = new Set<string>();
	for (const module of modules) {
		for (const dependency of [...module.dependencies, ...module.implicitlyLoadedBefore]) {
			if (
				!(dependency instanceof ExternalModule) &&
				!dependency.isExecuted &&
				(dependency.info.moduleSideEffects || module.implicitlyLoadedBefore.has(dependency)) &&
				!visitedModules.has(dependency.id)
			) {
				dependency.isExecuted = true;
				visitedModules.add(dependency.id);
				modules.push(dependency);
			}
		}
	}
}
