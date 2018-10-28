import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { randomUint8Array, Uint8ArrayEqual, Uint8ArrayXor } from './entryHashing';
import error from './error';
import { relative } from './path';
import relativeId from './relativeId';

interface OrderedExecutionUnit {
	execIndex: number;
}

const compareExecIndex = <T extends OrderedExecutionUnit>(unitA: T, unitB: T) =>
	unitA.execIndex > unitB.execIndex ? 1 : -1;

export function sortByExecutionOrder(units: OrderedExecutionUnit[]) {
	units.sort(compareExecIndex);
}

export function analyzeModuleExecution(
	entryModules: Module[],
	generateChunkColouringHashes: boolean,
	inlineDynamicImports: boolean,
	manualChunkModules: Record<string, Module[]>
) {
	let curEntry: Module, curEntryHash: Uint8Array;
	const cyclePaths: string[][] = [];
	const allSeen: { [id: string]: boolean } = {};

	const orderedModules: Module[] = [];
	let analyzedModuleCount = 0;

	const dynamicImports: Module[] = [];
	const dynamicImportAliases: string[] = [];

	let parents: { [id: string]: string };

	const visit = (module: Module) => {
		// Track entry point graph colouring by tracing all modules loaded by a given
		// entry point and colouring those modules by the hash of its id. Colours are mixed as
		// hash xors, providing the unique colouring of the graph into unique hash chunks.
		// This is really all there is to automated chunking, the rest is chunk wiring.
		if (generateChunkColouringHashes) {
			if (!curEntry.chunkAlias) {
				Uint8ArrayXor(module.entryPointsHash, curEntryHash);
			} else {
				// manual chunks are indicated in this phase by having a chunk alias
				// they are treated as a single colour in the colouring
				// and aren't divisable by future colourings
				module.chunkAlias = curEntry.chunkAlias;
				module.entryPointsHash = curEntryHash;
			}
		}

		for (const depModule of module.dependencies) {
			if (depModule instanceof ExternalModule) {
				depModule.execIndex = analyzedModuleCount++;
				continue;
			}

			if (depModule.id in parents) {
				if (!allSeen[depModule.id]) {
					cyclePaths.push(getCyclePath(depModule.id, module.id, parents));
				}
				continue;
			}

			parents[depModule.id] = module.id;
			if (!depModule.isEntryPoint && !depModule.chunkAlias) visit(depModule);
		}

		for (const dynamicModule of module.dynamicImportResolutions) {
			if (!(dynamicModule.resolution instanceof Module)) continue;
			// If the parent module of a dynamic import is to a child module whose graph
			// colouring is the same as the parent module, then that dynamic import does
			// not need to be treated as a new entry point as it is in the static graph
			if (
				!generateChunkColouringHashes ||
				(!dynamicModule.resolution.chunkAlias &&
					!Uint8ArrayEqual(dynamicModule.resolution.entryPointsHash, curEntry.entryPointsHash))
			) {
				if (dynamicImports.indexOf(dynamicModule.resolution) === -1) {
					dynamicImports.push(dynamicModule.resolution);
					dynamicImportAliases.push(dynamicModule.alias);
				}
			}
		}

		if (allSeen[module.id]) return;
		allSeen[module.id] = true;

		module.execIndex = analyzedModuleCount++;
		orderedModules.push(module);
	};

	if (generateChunkColouringHashes && manualChunkModules) {
		for (const chunkName of Object.keys(manualChunkModules)) {
			curEntryHash = randomUint8Array(10);

			for (curEntry of manualChunkModules[chunkName]) {
				if (curEntry.chunkAlias) {
					error({
						code: 'INVALID_CHUNK',
						message: `Cannot assign ${relative(
							process.cwd(),
							curEntry.id
						)} to the "${chunkName}" chunk as it is already in the "${curEntry.chunkAlias}" chunk.
Try defining "${chunkName}" first in the manualChunks definitions of the Rollup configuration.`
					});
				}
				curEntry.chunkAlias = chunkName;
				parents = { [curEntry.id]: null };
				visit(curEntry);
			}
		}
	}

	for (curEntry of entryModules) {
		curEntry.isEntryPoint = true;
		curEntryHash = randomUint8Array(10);
		parents = { [curEntry.id]: null };
		visit(curEntry);
	}

	// new items can be added during this loop
	for (curEntry of dynamicImports) {
		if (curEntry.isEntryPoint) continue;
		if (!inlineDynamicImports) curEntry.isEntryPoint = true;
		curEntryHash = randomUint8Array(10);
		parents = { [curEntry.id]: null };
		visit(curEntry);
	}

	return { orderedModules, dynamicImports, dynamicImportAliases, cyclePaths };
}

function getCyclePath(id: string, parentId: string, parents: { [id: string]: string | null }) {
	const path = [relativeId(id)];
	let curId = parentId;
	while (curId !== id) {
		path.push(relativeId(curId));
		curId = parents[curId];
		if (!curId) break;
	}
	path.push(path[0]);
	path.reverse();
	return path;
}
