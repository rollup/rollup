import Module from '../Module';
import { cloneUint8Array, randomUint8Array, Uint8ArrayEqual, Uint8ArrayXor } from './entryHashing';

function getOrCreateSetInMap<TKey, TSet>(map: Map<TKey, Set<TSet>>, key: TKey): Set<TSet> {
	const set = map.get(key) || new Set();
	map.set(key, set);
	return set;
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	const colouredModules: Set<Module> = new Set();
	const moduleImportersByModule: Map<Module, Set<Module>> = new Map();

	function allImportersHaveColour(module: Module, colour: Uint8Array): boolean {
		const importers = moduleImportersByModule.get(module);
		console.log('checking', module.id.split('/').pop(), importers && importers.size);
		if (!importers) {
			return false;
		}
		return [...importers].every(importer => {
			console.log('importer', importer.id.split('/').pop(), importer.entryPointsHash, colour);
			return (
				Uint8ArrayEqual(importer.entryPointsHash, colour) ||
				allImportersHaveColour(importer, colour)
			);
		});
	}

	function colourModule(
		rootModule: Module,
		colour: Uint8Array,
		rootImporterColour?: Uint8Array
	): void {
		const visitedModules: Set<Module> = new Set();

		function process(module: Module): void {
			if (visitedModules.has(module)) {
				// TODO what if it's from a different import?
				return;
			}
			visitedModules.add(module);

			if (rootModule.manualChunkAlias) {
				// TODO what if module already has another alias?
				module.manualChunkAlias = rootModule.manualChunkAlias;
				module.entryPointsHash = cloneUint8Array(colour);
			} else {
				if (!colouredModules.has(module)) {
					module.entryPointsHash = cloneUint8Array(colour);
				} else if (module === rootModule) {
					// force new colour
					Uint8ArrayXor(module.entryPointsHash, colour);
				} else {
					if (!rootImporterColour || !allImportersHaveColour(module, rootImporterColour)) {
						Uint8ArrayXor(module.entryPointsHash, colour);
					} // else colour can remain the same, because it's always coming from the colour that imported the rootModule
				}
			}
			console.log('!! ', module.id.split('/').pop(), module.entryPointsHash);
			colouredModules.add(module);

			for (const dependency of module.dependencies) {
				if (dependency instanceof Module) {
					getOrCreateSetInMap(moduleImportersByModule, dependency).add(module);
					process(dependency);
				}
			}

			for (const { resolution } of module.dynamicImports) {
				if (
					resolution instanceof Module &&
					resolution.dynamicallyImportedBy.length > 0 &&
					!resolution.manualChunkAlias // TODO
				) {
					getOrCreateSetInMap(moduleImportersByModule, resolution).add(module);
					colourModule(resolution, randomUint8Array(10), module.entryPointsHash);
				}
			}
		}

		process(rootModule);
	}

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const colour = randomUint8Array(10);

			for (const module of manualChunkModules[chunkName]) {
				colourModule(module, colour);
			}
		}
	}

	for (const module of entryModules) {
		const colour = randomUint8Array(10);
		if (!module.manualChunkAlias) {
			// TODO
			colourModule(module, colour);
		}
	}
}
