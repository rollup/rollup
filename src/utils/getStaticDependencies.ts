import type Chunk from '../Chunk';
import ExternalChunk from '../ExternalChunk';
import ExternalModule from '../ExternalModule';
import type Module from '../Module';

export function getStaticDependencies(
	chunk: Chunk,
	orderedModules: readonly Module[],
	chunkByModule: ReadonlyMap<Module, Chunk>,
	externalChunkByModule: ReadonlyMap<ExternalModule, ExternalChunk>
): Set<Chunk | ExternalChunk> {
	const staticDependencyBlocks: (Chunk | ExternalChunk)[][] = [];
	const handledDependencies = new Set<Module>();
	for (let modulePos = orderedModules.length - 1; modulePos >= 0; modulePos--) {
		const module = orderedModules[modulePos];
		if (!handledDependencies.has(module)) {
			const staticDependencies: (Chunk | ExternalChunk)[] = [];
			addStaticDependencies(
				module,
				staticDependencies,
				handledDependencies,
				chunk,
				chunkByModule,
				externalChunkByModule
			);
			staticDependencyBlocks.unshift(staticDependencies);
		}
	}
	const dependencies = new Set<Chunk | ExternalChunk>();
	for (const block of staticDependencyBlocks) {
		for (const dependency of block) {
			dependencies.add(dependency);
		}
	}
	return dependencies;
}

function addStaticDependencies(
	module: Module,
	staticDependencies: (Chunk | ExternalChunk)[],
	handledModules: Set<Module>,
	chunk: Chunk,
	chunkByModule: ReadonlyMap<Module, Chunk>,
	externalChunkByModule: ReadonlyMap<ExternalModule, ExternalChunk>
): void {
	const dependencies = module.getDependenciesToBeIncluded();
	for (const dependency of dependencies) {
		if (dependency instanceof ExternalModule) {
			staticDependencies.push(externalChunkByModule.get(dependency)!);
			continue;
		}
		const dependencyChunk = chunkByModule.get(dependency)!;
		if (dependencyChunk !== chunk) {
			staticDependencies.push(dependencyChunk);
			continue;
		}
		if (!handledModules.has(dependency)) {
			handledModules.add(dependency);
			addStaticDependencies(
				dependency,
				staticDependencies,
				handledModules,
				chunk,
				chunkByModule,
				externalChunkByModule
			);
		}
	}
}
