import Module from '../Module';
import { cloneUint8Array, copyUint8Array, randomUint8Array, Uint8ArrayEqual } from './entryHashing';

function randomColour(): Uint8Array {
	return randomUint8Array(10);
}

function trailContainsColour(trail: Module[], colour: Uint8Array): boolean {
	return trail.some(module => Uint8ArrayEqual(module.entryPointsHash, colour));
}

function arraysEqual<T>(a: Array<T>, b: Array<T>): boolean {
	return a.length === b.length && a.every((item, i) => item === b[i]);
}

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	const colouredModules: Set<Module> = new Set();

	function recolourModules(
		inputEntryModules: Array<{ colour: Uint8Array; rootModule: Module }>
	): void {
		const newEntryModules: Array<{
			module: Module;
			trail: Module[];
		}> = [];

		function registerNewEntryPoint(module: Module, trail: Module[]): void {
			const alreadySeen = newEntryModules.some(
				entry => entry.module === module && arraysEqual(entry.trail, trail)
			);
			if (!alreadySeen) {
				newEntryModules.push({
					module,
					trail
				});
			}
		}

		function _recolourModule(rootModule: Module, trail: Module[], colour: Uint8Array): void {
			const sourceColour = cloneUint8Array(rootModule.entryPointsHash);

			function process(module: Module, trail: Module[]): void {
				if (module.manualChunkAlias && colouredModules.has(module)) {
					// this module has already been coloured as part of another manual chunk
					return;
				}

				if (
					module.manualChunkAlias ||
					(!trailContainsColour(trail, module.entryPointsHash) &&
						Uint8ArrayEqual(module.entryPointsHash, sourceColour))
				) {
					copyUint8Array(module.entryPointsHash, colour);
					colouredModules.add(module);
					for (const dependency of module.dependencies) {
						if (dependency instanceof Module) {
							if (!module.manualChunkAlias) {
								process(dependency, [...trail, module]);
							} else if (!dependency.manualChunkAlias) {
								dependency.manualChunkAlias = module.manualChunkAlias;
								process(dependency, [...trail, module]);
							}
						}
					}
					for (const { resolution } of module.dynamicImports) {
						if (
							resolution instanceof Module &&
							// TODO why this check?
							resolution.dynamicallyImportedBy.length > 0 &&
							!resolution.manualChunkAlias
						) {
							registerNewEntryPoint(resolution, [...trail, module]);
						}
					}
				} else {
					registerNewEntryPoint(module, trail);
				}
			}

			process(rootModule, trail);
		}

		for (let i = 0; i < inputEntryModules.length /* updates */; i++) {
			const { colour, rootModule } = inputEntryModules[i];
			_recolourModule(rootModule, [], colour);
		}

		for (let i = 0; i < newEntryModules.length /* updates */; i++) {
			const { module, trail } = newEntryModules[i];
			_recolourModule(module, trail, randomColour());
		}
	}

	const modules: Array<{ colour: Uint8Array; rootModule: Module }> = [];

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			const colour = randomColour();

			for (const module of manualChunkModules[chunkName]) {
				if (!module.manualChunkAlias) {
					throw new Error('Missing manualChunkAlias');
				}
				modules.push({ rootModule: module, colour });
			}
		}
	}

	for (const module of entryModules) {
		modules.push({ rootModule: module, colour: randomColour() });
	}

	recolourModules(modules);
}
