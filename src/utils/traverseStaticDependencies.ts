import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { NameCollection } from './reservedNames';

export function visitStaticModuleDependencies(
	baseModule: Module | ExternalModule,
	areDependenciesSkipped: (module: Module | ExternalModule) => boolean
) {
	const modules = [baseModule];
	const visitedModules: NameCollection = {};
	for (const module of modules) {
		if (areDependenciesSkipped(module) || module instanceof ExternalModule) continue;
		for (const dependency of module.dependencies) {
			if (!visitedModules[dependency.id]) {
				visitedModules[dependency.id] = true;
				modules.push(dependency);
			}
		}
	}
}
