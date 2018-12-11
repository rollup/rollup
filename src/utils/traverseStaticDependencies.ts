import ExternalModule from '../ExternalModule';
import Module from '../Module';

export function visitStaticDependencies(
	entryModule: Module | ExternalModule,
	areDependenciesSkipped: (module: Module | ExternalModule) => boolean
) {
	const modules = [entryModule];
	const visitedModules: { [id: string]: true } = {};
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
