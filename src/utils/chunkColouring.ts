import Module from '../Module';
import { cloneUint8Array, randomUint8Array, Uint8ArrayEqual } from './entryHashing';

function randomColour(): Uint8Array {
	return randomUint8Array(10);
}

function containsColour(colours: Set<Uint8Array>, colour: Uint8Array): boolean {
	return !!colours.size && [...colours].some(c => Uint8ArrayEqual(colour, c));
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	const colouredModules: Set<Module> = new Set();

	function recolourModule(
		rootModule: Module,
		coloursToRootModule: Set<Uint8Array>,
		importer: Module | null,
		colour: Uint8Array
	): void {
		const newEntryModules: Array<{
			coloursToModule: Set<Uint8Array>;
			importer: Module;
			module: Module;
		}> = [];

		function registerNewEntryPoint(
			module: Module,
			importer: Module,
			coloursToModule: Set<Uint8Array>
		): void {
			const alreadySeen = newEntryModules.some(
				entry => entry.module === module && entry.importer === importer
			);
			if (!alreadySeen) {
				newEntryModules.push({
					coloursToModule,
					importer,
					module
				});
			}
		}

		function _recolourModule(
			rootModule: Module,
			coloursToRootModule: Set<Uint8Array>,
			importer: Module | null,
			colour: Uint8Array
		): void {
			const visitedModules: Set<Module> = new Set();
			const sourceColour = cloneUint8Array(rootModule.entryPointsHash);

			function process(module: Module, importer: Module | null): void {
				if (visitedModules.has(module)) {
					return;
				}
				visitedModules.add(module);

				if (
					!module.manualChunkAlias &&
					containsColour(coloursToRootModule, module.entryPointsHash)
				) {
					// colour can remain the same, because every route to this module
					// passes through a colour that has already been loaded
				} else if (module.manualChunkAlias && colouredModules.has(module)) {
					// this module has already been coloured as part of another manual chunk
				} else if (
					module.manualChunkAlias ||
					!importer /* if there's no importer module === rootModule so it must be equal */ ||
					Uint8ArrayEqual(module.entryPointsHash, sourceColour)
				) {
					module.entryPointsHash = cloneUint8Array(colour);
					colouredModules.add(module);
					for (const dependency of module.dependencies) {
						if (dependency instanceof Module) {
							if (!module.manualChunkAlias) {
								process(dependency, module);
							} else if (!dependency.manualChunkAlias) {
								dependency.manualChunkAlias = module.manualChunkAlias;
								process(dependency, module);
							}
						}
					}
					for (const { resolution } of module.dynamicImports) {
						if (
							resolution instanceof Module &&
							resolution.dynamicallyImportedBy.length > 0 &&
							!resolution.manualChunkAlias // TODO
						) {
							const coloursToModule = new Set(coloursToRootModule);
							coloursToModule.add(module.entryPointsHash);
							registerNewEntryPoint(resolution, module, coloursToModule);
						}
					}
				} else {
					const coloursToModule = new Set(coloursToRootModule);
					coloursToModule.add(importer.entryPointsHash);
					registerNewEntryPoint(module, importer, coloursToModule);
				}
			}

			process(rootModule, importer);
		}

		_recolourModule(rootModule, coloursToRootModule, importer, colour);

		for (let i = 0; i < newEntryModules.length /* note this updates */; i++) {
			const { module, importer, coloursToModule } = newEntryModules[i];
			_recolourModule(module, coloursToModule, importer, randomColour());
		}
	}

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const colour = randomColour();

			for (const module of manualChunkModules[chunkName]) {
				if (!module.manualChunkAlias) {
					throw new Error('Missing moduleChunkAlias');
				}
				recolourModule(module, new Set(), null, colour);
			}
		}
	}

	for (const module of entryModules) {
		recolourModule(module, new Set(), null, randomColour());
	}
}
