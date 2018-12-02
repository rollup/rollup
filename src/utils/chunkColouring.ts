import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { randomUint8Array, Uint8ArrayXor } from './entryHashing';
import { error } from './error';
import { relative } from './path';

export function assignChunkColouringHashes(
	entryModules: Module[],
	manualChunkModules: Record<string, Module[]>
) {
	let currentEntry: Module, currentEntryHash: Uint8Array;
	let modulesVisitedForCurrentEntry: { [id: string]: boolean };
	const handledEntryPoints: { [id: string]: boolean } = {};
	const dynamicImports: Set<Module> = new Set();

	const addCurrentEntryColourToModule = (module: Module) => {
		if (currentEntry.chunkAlias) {
			module.chunkAlias = currentEntry.chunkAlias;
			module.entryPointsHash = currentEntryHash;
		} else {
			Uint8ArrayXor(module.entryPointsHash, currentEntryHash);
		}

		for (const dependency of module.dependencies) {
			if (dependency instanceof ExternalModule || dependency.id in modulesVisitedForCurrentEntry) {
				continue;
			}
			modulesVisitedForCurrentEntry[dependency.id] = true;
			if (!handledEntryPoints[dependency.id] && !dependency.chunkAlias)
				addCurrentEntryColourToModule(dependency);
		}

		for (const { resolution } of module.dynamicImports) {
			if (
				resolution instanceof Module &&
				resolution.isDynamicEntryPoint &&
				!resolution.chunkAlias
			) {
				dynamicImports.add(resolution);
			}
		}
	};

	if (manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			currentEntryHash = randomUint8Array(10);

			for (currentEntry of manualChunkModules[chunkName]) {
				if (currentEntry.chunkAlias) {
					error({
						code: 'INVALID_CHUNK',
						message: `Cannot assign ${relative(
							process.cwd(),
							currentEntry.id
						)} to the "${chunkName}" chunk as it is already in the "${
							currentEntry.chunkAlias
						}" chunk.
Try defining "${chunkName}" first in the manualChunks definitions of the Rollup configuration.`
					});
				}
				currentEntry.chunkAlias = chunkName;
				modulesVisitedForCurrentEntry = { [currentEntry.id]: true };
				addCurrentEntryColourToModule(currentEntry);
			}
		}
	}

	for (currentEntry of entryModules) {
		handledEntryPoints[currentEntry.id] = true;
		currentEntryHash = randomUint8Array(10);
		modulesVisitedForCurrentEntry = { [currentEntry.id]: null };
		addCurrentEntryColourToModule(currentEntry);
	}

	for (currentEntry of Array.from(dynamicImports)) {
		if (handledEntryPoints[currentEntry.id]) {
			continue;
		}
		currentEntryHash = randomUint8Array(10);
		modulesVisitedForCurrentEntry = { [currentEntry.id]: null };
		addCurrentEntryColourToModule(currentEntry);
	}
}
