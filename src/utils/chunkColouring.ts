import Module from '../Module';
import { cloneUint8Array, randomUint8Array, Uint8ArrayEqual, Uint8ArrayXor } from './entryHashing';

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

	function paintModules(inputEntryModules: Array<{ paint: Uint8Array; rootModule: Module }>): void {
		const entryModules: Array<{
			paint: Uint8Array;
			rootModule: Module;
			trail: Module[];
		}> = inputEntryModules.map(({ paint, rootModule }) => ({
			paint,
			rootModule,
			trail: []
		}));

		function registerNewEntryPoint(module: Module, trail: Module[], paint: Uint8Array): void {
			const alreadySeen =
				trail.includes(module) ||
				entryModules.some(entry => entry.rootModule === module && arraysEqual(entry.trail, trail));
			if (!alreadySeen) {
				entryModules.push({
					paint,
					rootModule: module,
					trail
				});
			}
		}

		function _paintModule(rootModule: Module, trail: Module[], paint: Uint8Array): void {
			const sourceColour = cloneUint8Array(rootModule.entryPointsHash);

			function process(module: Module, trail: Module[]): void {
				if (module.manualChunkAlias && colouredModules.has(module)) {
					// this module has already been coloured as part of another manual chunk
					return;
				}

				// TODO uncommenting fixes circular-entry-points but breaks others
				// if (module !== rootModule && entryModules.some(a => a.rootModule === module)) {
				// 	return;
				// }

				if (!module.manualChunkAlias && trailContainsColour(trail, module.entryPointsHash)) {
					//
				} else if (
					module.manualChunkAlias ||
					(!trailContainsColour(trail, module.entryPointsHash) &&
						Uint8ArrayEqual(module.entryPointsHash, sourceColour))
				) {
					Uint8ArrayXor(module.entryPointsHash, paint);
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
							// registerNewEntryPoint(resolution, [...trail, module], module.entryPointsHash);
							registerNewEntryPoint(resolution, [...trail, module], randomColour());
						}
					}
				} else {
					// TODO out of bounds?
					registerNewEntryPoint(module, trail, trail[trail.length - 1].entryPointsHash);
				}
			}

			process(rootModule, trail);
		}

		for (let i = 0; i < entryModules.length /* updates */; i++) {
			const { paint, rootModule, trail } = entryModules[i];
			_paintModule(rootModule, trail, paint);
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
