import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { randomUint8Array, Uint8ArrayXor } from './entryHashing';

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	let currentEntry: Module, currentEntryHash: Uint8Array;
	let modulesVisitedForCurrentEntry: Set<string>;
	const handledEntryPoints: Set<string> = new Set();
	const dynamicImports: Module[] = [];
	const dependentEntryPointsByModule: Map<Module, Set<Module>> = new Map();
	const dynamicDependentEntryPointsByDynamicEntry: Map<Module, Set<Module>> = new Map();

	const addCurrentEntryColourToModule = (module: Module) => {
		if (currentEntry.manualChunkAlias) {
			module.manualChunkAlias = currentEntry.manualChunkAlias;
			module.entryPointsHash = currentEntryHash;
		} else {
			Uint8ArrayXor(module.entryPointsHash, currentEntryHash);
		}

		const dependentEntryPoints = dependentEntryPointsByModule.get(module) || new Set();
		dependentEntryPointsByModule.set(module, dependentEntryPoints);
		dependentEntryPoints.add(module);

		for (const dependency of module.dependencies) {
			if (
				dependency instanceof ExternalModule ||
				modulesVisitedForCurrentEntry.has(dependency.id)
			) {
				continue;
			}
			dependentEntryPoints.add(dependency);
			modulesVisitedForCurrentEntry.add(dependency.id);
			if (!handledEntryPoints.has(dependency.id) && !dependency.manualChunkAlias) {
				addCurrentEntryColourToModule(dependency);
			}
		}

		for (const { resolution } of module.dynamicImports) {
			if (
				resolution instanceof Module &&
				resolution.dynamicallyImportedBy.length > 0 &&
				!resolution.manualChunkAlias
			) {
				const dynamicImportDependentEntryPoints =
					dependentEntryPointsByModule.get(resolution) || new Set();

				const dynamicDependentEntryPoints =
					dynamicDependentEntryPointsByDynamicEntry.get(resolution) || new Set();
				dynamicDependentEntryPointsByDynamicEntry.set(resolution, dynamicDependentEntryPoints);

				dynamicImportDependentEntryPoints.forEach(entryPoint =>
					dynamicDependentEntryPoints.add(entryPoint)
				);
				dynamicImports.push(resolution);
			}
		}
	};

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			currentEntryHash = randomUint8Array(10);

			for (currentEntry of manualChunkModules[chunkName]) {
				modulesVisitedForCurrentEntry = new Set([currentEntry.id]);
				addCurrentEntryColourToModule(currentEntry);
			}
		}
	}

	for (currentEntry of entryModules) {
		handledEntryPoints.add(currentEntry.id);
		currentEntryHash = randomUint8Array(10);
		modulesVisitedForCurrentEntry = new Set([currentEntry.id]);
		if (!currentEntry.manualChunkAlias) {
			addCurrentEntryColourToModule(currentEntry);
		}
	}

	for (currentEntry of dynamicImports) {
		if (handledEntryPoints.has(currentEntry.id)) {
			continue;
		}
		handledEntryPoints.add(currentEntry.id);
		const dynamicDependentEntryPoints = dynamicDependentEntryPointsByDynamicEntry.get(currentEntry);
		const dependentEntryPoints = dependentEntryPointsByModule.get(currentEntry);
		const inMemory = [...(dynamicDependentEntryPoints || [])].every(
			dynamicDependentEntryPoint =>
				dependentEntryPoints && dependentEntryPoints.has(dynamicDependentEntryPoint)
		);
		if (inMemory) {
			continue;
		}
		currentEntryHash = randomUint8Array(10);
		modulesVisitedForCurrentEntry = new Set([currentEntry.id]);
		addCurrentEntryColourToModule(currentEntry);
	}
}
