import Module from '../Module';
import { randomUint8Array, Uint8ArrayXor } from './entryHashing';

function randomColour(): Uint8Array {
	return randomUint8Array(10);
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
	return a.size === b.size && [...a].every(item => b.has(item));
}

interface StaticModuleGroup {
	dynamicEntries: Set<Module>;
	modules: Set<Module>;
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	const colouredModules: Set<Module> = new Set();
	const staticModuleGroups: Map<Module, StaticModuleGroup> = new Map();

	function collectStaticModuleGroup(rootModule: Module): StaticModuleGroup {
		if (staticModuleGroups.has(rootModule)) {
			return staticModuleGroups.get(rootModule)!;
		}
		const modules = new Set<Module>();
		const dynamicEntries = new Set<Module>();
		const group: StaticModuleGroup = { modules, dynamicEntries };
		staticModuleGroups.set(rootModule, group);
		const process = (module: Module, importer: Module | null) => {
			if (modules.has(module)) {
				return;
			}
			modules.add(module);
			if (!module.manualChunkAlias && importer?.manualChunkAlias) {
				module.manualChunkAlias = importer.manualChunkAlias;
			}
			// TODO remove reverse? needed because previously manual chunk alias propogation was other way
			for (const dependency of module.dependencies.slice().reverse()) {
				if (dependency instanceof Module) {
					process(dependency, module);
				}
			}
			for (const { resolution } of module.dynamicImports) {
				if (resolution instanceof Module && resolution.dynamicallyImportedBy.length > 0) {
					dynamicEntries.add(resolution);
				}
			}
		};
		process(rootModule, null);
		return group;
	}

	function paintModules(inputEntryModules: Array<{ paint: Uint8Array; rootModule: Module }>): void {
		const entryModules: Array<{
			loadedModules: Set<Module>;
			paint: Uint8Array;
			rootModule: Module;
		}> = inputEntryModules.map(({ paint, rootModule }) => ({
			loadedModules: new Set(),
			paint,
			rootModule
		}));

		function registerNewEntryPoint(
			rootModule: Module,
			loadedModules: Set<Module>,
			paint: Uint8Array
		): void {
			const alreadySeen = entryModules.some(
				entry => entry.rootModule === rootModule && setsEqual(entry.loadedModules, loadedModules)
			);
			if (!alreadySeen) {
				entryModules.push({
					loadedModules,
					paint,
					rootModule
				});
			}
		}

		function paintModule(rootModule: Module, loadedModules: Set<Module>, paint: Uint8Array): void {
			const { modules, dynamicEntries } = collectStaticModuleGroup(rootModule);
			const newLoadedModules = new Set([...loadedModules, ...modules]);
			for (const module of modules) {
				if (module.manualChunkAlias) {
					if (
						!colouredModules.has(module) &&
						rootModule.manualChunkAlias === module.manualChunkAlias
					) {
						Uint8ArrayXor(module.entryPointsHash, paint);
						colouredModules.add(module);
					}
				} else {
					if (!colouredModules.has(module) || !loadedModules.has(module)) {
						Uint8ArrayXor(module.entryPointsHash, paint);
						colouredModules.add(module);
					}
				}
			}
			for (const module of dynamicEntries) {
				registerNewEntryPoint(module, newLoadedModules, randomColour());
			}
		}

		for (let i = 0; i < entryModules.length /* updates */; i++) {
			const { paint, rootModule, loadedModules } = entryModules[i];
			paintModule(rootModule, loadedModules, paint);
		}
	}

	const modules: Array<{ paint: Uint8Array; rootModule: Module }> = [];

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const paint = randomColour();

			for (const module of manualChunkModules[chunkName]) {
				if (!module.manualChunkAlias) {
					throw new Error('Missing manualChunkAlias');
				}
				modules.push({ rootModule: module, paint });
			}
		}
	}

	for (const module of entryModules) {
		modules.push({ rootModule: module, paint: randomColour() });
	}

	paintModules(modules);
}
