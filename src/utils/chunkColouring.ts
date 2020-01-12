import Module from '../Module';
import { cloneUint8Array, randomUint8Array, Uint8ArrayEqual } from './entryHashing';

function randomColour(): Uint8Array {
	return randomUint8Array(10);
}

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

			if (containsColour(coloursToRootModule, module.entryPointsHash)) {
				// colour can remain the same, because every route to this module
				// passes through a colour that has already been loaded
			} else if (
				!importer /* if there's no importer module === rootModule so it must be equal */ ||
				Uint8ArrayEqual(module.entryPointsHash, sourceColour)
			) {
				module.entryPointsHash = cloneUint8Array(colour);
				for (const dependency of module.dependencies) {
					if (dependency instanceof Module) {
						process(dependency, module);
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

function containsColour(colours: Set<Uint8Array>, colour: Uint8Array): boolean {
	return !!colours.size && [...colours].some(c => Uint8ArrayEqual(colour, c));
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const colour = randomColour();

			for (const module of manualChunkModules[chunkName]) {
				recolourModule(module, new Set(), null, colour);
			}
		}
	}

	for (const module of entryModules) {
		// TODO what is this check?
		if (!module.manualChunkAlias) {
			recolourModule(module, new Set(), null, randomColour());
		}
	}
}
