import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { NameCollection } from './reservedNames';

export function markModuleAndImpureDependenciesAsExecuted(baseModule: Module) {
	baseModule.isExecuted = true;
	const modules = [baseModule];
	const visitedModules: NameCollection = {};
	for (const module of modules) {
		for (const dependency of module.dependencies) {
			if (
				!(dependency instanceof ExternalModule) &&
				!dependency.isExecuted &&
				dependency.moduleSideEffects &&
				!visitedModules[dependency.id]
			) {
				dependency.isExecuted = true;
				visitedModules[dependency.id] = true;
				modules.push(dependency);
			}
		}
	}
}
