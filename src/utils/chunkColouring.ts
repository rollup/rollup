import Module from '../Module';
import { cloneUint8Array, randomUint8Array, Uint8ArrayEqual, Uint8ArrayXor } from './entryHashing';

function getOrCreateSetInMap<TKey, TSet>(map: Map<TKey, Set<TSet>>, key: TKey): Set<TSet> {
	const set = map.get(key) || new Set();
	map.set(key, set);
	return set;
}

function randomColour(): Uint8Array {
	return randomUint8Array(10);
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	const colouredModules: Set<Module> = new Set();
	const moduleImportersByModule: Map<Module, Set<Module>> = new Map();

	function allImportersHaveColour(module: Module, colours: Set<Uint8Array>): boolean {
		const importers = moduleImportersByModule.get(module);
		// console.log('checking', module.id.split('/').pop(), importers && importers.size);
		if (!importers) {
			return false;
		}
		return [...importers].every(importer => {
			// console.log('importer', importer.id.split('/').pop(), importer.entryPointsHash, colours);
			return (
				[...colours].some(colour => Uint8ArrayEqual(importer.entryPointsHash, colour)) ||
				allImportersHaveColour(importer, colours)
			);
		});
	}

	function colourModule(
		rootModule: Module,
		coloursToRoot: Set<Uint8Array>,
		colour: Uint8Array
	): void {
		const visitedModules: Set<Module> = new Set();

		function process(module: Module): void {
			if (visitedModules.has(module)) {
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
				} else if (!coloursToRoot.size || !allImportersHaveColour(module, coloursToRoot)) {
					Uint8ArrayXor(module.entryPointsHash, colour);
				} else {
					// colour can remain the same, because every route into this point
					// comes from a colour that has already been loaded
				}
			}
			// console.log('!! ', module.id.split('/').pop(), module.entryPointsHash);
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
					const coloursToNewRoot = new Set(coloursToRoot);
					coloursToNewRoot.add(module.entryPointsHash);
					colourModule(resolution, coloursToNewRoot, randomColour());
				}
			}
		}

		process(rootModule);
	}

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const colour = randomColour();

			for (const module of manualChunkModules[chunkName]) {
				colourModule(module, new Set(), colour);
			}
		}
	}

	for (const module of entryModules) {
		const colour = randomColour();
		// TODO what is this check?
		if (!module.manualChunkAlias) {
			colourModule(module, new Set(), colour);
		}
	}
}
