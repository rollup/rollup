import Chunk from '../Chunk';
import ExternalModule from '../ExternalModule';
import Module from '../Module';

export function getStaticDependencies(
	chunk: Chunk,
	orderedModules: readonly Module[],
	chunkByModule: ReadonlyMap<Module, Chunk>
): Set<Chunk | ExternalModule> {
	const staticDependencyBlocks: (Chunk | ExternalModule)[][] = [];
	const handledDependencies = new Set<Module>();
	for (let modulePos = orderedModules.length - 1; modulePos >= 0; modulePos--) {
		const module = orderedModules[modulePos];
		if (!handledDependencies.has(module)) {
			const staticDependencies: (Chunk | ExternalModule)[] = [];
			addStaticDependencies(module, staticDependencies, handledDependencies, chunk, chunkByModule);
			staticDependencyBlocks.unshift(staticDependencies);
		}
	}
	const dependencies = new Set<Chunk | ExternalModule>();
	for (const block of staticDependencyBlocks) {
		for (const dependency of block) {
			dependencies.add(dependency);
		}
	}
	return dependencies;
}

function addStaticDependencies(
	module: Module,
	staticDependencies: (Chunk | ExternalModule)[],
	handledModules: Set<Module>,
	chunk: Chunk,
	chunkByModule: ReadonlyMap<Module, Chunk>
): void {
	const dependencies = module.getDependenciesToBeIncluded();
	for (const dependency of dependencies) {
		if (dependency instanceof ExternalModule) {
			staticDependencies.push(dependency);
			continue;
		}
		const dependencyChunk = chunkByModule.get(dependency)!;
		if (dependencyChunk !== chunk) {
			staticDependencies.push(dependencyChunk);
			continue;
		}
		if (!handledModules.has(dependency)) {
			handledModules.add(dependency);
			addStaticDependencies(dependency, staticDependencies, handledModules, chunk, chunkByModule);
		}
	}
}
