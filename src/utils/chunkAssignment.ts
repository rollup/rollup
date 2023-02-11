import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getNewSet, getOrCreate } from './getOrCreate';
import { concatLazy } from './iterators';
import { timeEnd, timeStart } from './timers';

type DependentModuleMap = Map<Module, Set<Module>>;
type ReadonlyDependentModuleMap = ReadonlyMap<Module, ReadonlySet<Module>>;
type ChunkDefinitions = { alias: string | null; modules: Module[] }[];

export function getChunkAssignments(
	entries: readonly Module[],
	manualChunkAliasByEntry: ReadonlyMap<Module, string>,
	minChunkSize: number,
	deepChunkOptimization: boolean
): ChunkDefinitions {
	const chunkDefinitions: ChunkDefinitions = [];
	const modulesInManualChunks = new Set(manualChunkAliasByEntry.keys());
	const manualChunkModulesByAlias: Record<string, Module[]> = Object.create(null);
	for (const [entry, alias] of manualChunkAliasByEntry) {
		addStaticDependenciesToManualChunk(
			entry,
			(manualChunkModulesByAlias[alias] ||= []),
			modulesInManualChunks
		);
	}
	for (const [alias, modules] of Object.entries(manualChunkModulesByAlias)) {
		chunkDefinitions.push({ alias, modules });
	}

	const { allEntries, dependentEntriesByModule, dynamicallyDependentEntriesByDynamicEntry } =
		analyzeModuleGraph(entries);

	const staticEntries = new Set(entries);
	const assignedEntriesByModule: DependentModuleMap = new Map();

	for (const entry of allEntries) {
		if (!modulesInManualChunks.has(entry)) {
			assignEntryToStaticDependencies(
				entry,
				dependentEntriesByModule,
				assignedEntriesByModule,
				modulesInManualChunks,
				staticEntries,
				dynamicallyDependentEntriesByDynamicEntry,
				deepChunkOptimization
			);
		}
	}

	chunkDefinitions.push(...createChunks(allEntries, assignedEntriesByModule, minChunkSize));
	return chunkDefinitions;
}

function addStaticDependenciesToManualChunk(
	entry: Module,
	manualChunkModules: Module[],
	modulesInManualChunks: Set<Module>
): void {
	const modulesToHandle = new Set([entry]);
	for (const module of modulesToHandle) {
		modulesInManualChunks.add(module);
		manualChunkModules.push(module);
		for (const dependency of module.dependencies) {
			if (!(dependency instanceof ExternalModule || modulesInManualChunks.has(dependency))) {
				modulesToHandle.add(dependency);
			}
		}
	}
}

function analyzeModuleGraph(entries: Iterable<Module>): {
	allEntries: Module[];
	dependentEntriesByModule: DependentModuleMap;
	dynamicallyDependentEntriesByDynamicEntry: DependentModuleMap;
} {
	const dynamicEntries = new Set<Module>();
	const dependentEntriesByModule: DependentModuleMap = new Map();
	const allEntries = new Set(entries);
	for (const currentEntry of allEntries) {
		const modulesToHandle = new Set([currentEntry]);
		for (const module of modulesToHandle) {
			getOrCreate(dependentEntriesByModule, module, getNewSet).add(currentEntry);
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule)) {
					modulesToHandle.add(dependency);
				}
			}
			for (const { resolution } of module.dynamicImports) {
				if (
					resolution instanceof Module &&
					resolution.includedDynamicImporters.length > 0 &&
					!allEntries.has(resolution)
				) {
					dynamicEntries.add(resolution);
					allEntries.add(resolution);
				}
			}
			for (const dependency of module.implicitlyLoadedBefore) {
				if (!allEntries.has(dependency)) {
					dynamicEntries.add(dependency);
					allEntries.add(dependency);
				}
			}
		}
	}
	return {
		allEntries: [...allEntries],
		dependentEntriesByModule,
		dynamicallyDependentEntriesByDynamicEntry: getDynamicallyDependentEntriesByDynamicEntry(
			dependentEntriesByModule,
			dynamicEntries
		)
	};
}

function getDynamicallyDependentEntriesByDynamicEntry(
	dependentEntriesByModule: ReadonlyDependentModuleMap,
	dynamicEntries: ReadonlySet<Module>
): DependentModuleMap {
	const dynamicallyDependentEntriesByDynamicEntry: DependentModuleMap = new Map();
	for (const dynamicEntry of dynamicEntries) {
		const dynamicallyDependentEntries = getOrCreate(
			dynamicallyDependentEntriesByDynamicEntry,
			dynamicEntry,
			getNewSet
		);
		for (const importer of [
			...dynamicEntry.includedDynamicImporters,
			...dynamicEntry.implicitlyLoadedAfter
		]) {
			for (const entry of dependentEntriesByModule.get(importer)!) {
				dynamicallyDependentEntries.add(entry);
			}
		}
	}
	return dynamicallyDependentEntriesByDynamicEntry;
}

function assignEntryToStaticDependencies(
	entry: Module,
	dependentEntriesByModule: ReadonlyDependentModuleMap,
	assignedEntriesByModule: DependentModuleMap,
	modulesInManualChunks: ReadonlySet<Module>,
	staticEntries: ReadonlySet<Module>,
	dynamicallyDependentEntriesByDynamicEntry: ReadonlyDependentModuleMap,
	deepChunkOptimization: boolean
) {
	const dynamicallyDependentEntries = dynamicallyDependentEntriesByDynamicEntry.get(entry);
	const modulesToHandle = new Set([entry]);
	for (const module of modulesToHandle) {
		const assignedEntries = getOrCreate(assignedEntriesByModule, module, getNewSet);
		if (
			dynamicallyDependentEntries &&
			isModuleAlreadyLoaded(
				dynamicallyDependentEntries,
				dependentEntriesByModule.get(module)!,
				staticEntries,
				dynamicallyDependentEntriesByDynamicEntry,
				deepChunkOptimization
			)
		) {
			continue;
		} else {
			assignedEntries.add(entry);
		}
		for (const dependency of module.getDependenciesToBeIncluded()) {
			if (!(dependency instanceof ExternalModule || modulesInManualChunks.has(dependency))) {
				modulesToHandle.add(dependency);
			}
		}
	}
}

const MAX_ENTRIES_TO_CHECK_FOR_SHARED_DEPENDENCIES = 3;

// An approach to further speed this up might be
// - first, create chunks without looking for modules already in memory
// - all modules that are in the same chunk after this will behave the same
//   -> Do not iterate by module but by equivalence group and merge chunks
function isModuleAlreadyLoaded(
	dynamicallyDependentEntries: ReadonlySet<Module>,
	containedIn: ReadonlySet<Module>,
	staticEntries: ReadonlySet<Module>,
	dynamicallyDependentEntriesByDynamicEntry: ReadonlyDependentModuleMap,
	deepChunkOptimization: boolean
): boolean {
	if (
		!deepChunkOptimization &&
		dynamicallyDependentEntries.size > MAX_ENTRIES_TO_CHECK_FOR_SHARED_DEPENDENCIES
	) {
		return false;
	}
	const entriesToCheck = new Set(dynamicallyDependentEntries);
	for (const entry of entriesToCheck) {
		if (!containedIn.has(entry)) {
			if (staticEntries.has(entry)) {
				return false;
			}
			const dynamicallyDependentEntries = dynamicallyDependentEntriesByDynamicEntry.get(entry)!;
			if (
				!deepChunkOptimization &&
				dynamicallyDependentEntries.size > MAX_ENTRIES_TO_CHECK_FOR_SHARED_DEPENDENCIES
			) {
				return false;
			}
			for (const dependentEntry of dynamicallyDependentEntries) {
				entriesToCheck.add(dependentEntry);
			}
		}
	}
	return true;
}

interface ChunkDescription {
	// The signatures of all side effects included in or loaded with this chunk.
	// This is the intersection of all dependent entry side effects. As chunks are
	// merged, these sets are intersected.
	correlatedSideEffects: Set<string>;
	dependencies: Set<ChunkDescription>;
	dependentChunks: Set<ChunkDescription>;
	// The indices of the entries depending on this chunk
	dependentEntries: Set<number>;
	modules: Module[];
	pure: boolean;
	// These are only the sideEffects contained in that chunk
	sideEffects: Set<string>;
	size: number;
}

type ChunkPartition = {
	[key in 'small' | 'big']: Set<ChunkDescription>;
};

function createChunks(
	allEntries: Module[],
	assignedEntriesByModule: DependentModuleMap,
	minChunkSize: number
): ChunkDefinitions {
	const chunkModulesBySignature = getChunkModulesBySignature(assignedEntriesByModule, allEntries);
	return minChunkSize === 0
		? Object.values(chunkModulesBySignature).map(modules => ({
				alias: null,
				modules
		  }))
		: getOptimizedChunks(chunkModulesBySignature, allEntries.length, minChunkSize).map(
				({ modules }) => ({
					alias: null,
					modules
				})
		  );
}

function getChunkModulesBySignature(
	assignedEntriesByModule: ReadonlyDependentModuleMap,
	allEntries: Module[]
) {
	const chunkModules: { [chunkSignature: string]: Module[] } = Object.create(null);
	for (const [module, assignedEntries] of assignedEntriesByModule) {
		let chunkSignature = '';
		for (const entry of allEntries) {
			chunkSignature += assignedEntries.has(entry) ? CHAR_DEPENDENT : CHAR_INDEPENDENT;
		}
		const chunk = chunkModules[chunkSignature];
		if (chunk) {
			chunk.push(module);
		} else {
			chunkModules[chunkSignature] = [module];
		}
	}
	return chunkModules;
}

/**
 * This function tries to get rid of small chunks by merging them with other
 * chunks.
 *
 * We can only merge chunks safely if after the merge, loading any entry point
 * in any allowed order will not trigger side effects that should not have been
 * triggered. While side effects are usually things like global function calls,
 * global variable mutations or potentially thrown errors, details do not
 * matter here, and we just discern chunks without side effects (pure chunks)
 * from other chunks.
 *
 * As a first step, we assign each pre-generated chunk with side effects a
 * label. I.e. we have side effect "A" if the non-pure chunk "A" is loaded.
 *
 * Now to determine the side effects of loading a chunk, one also has to take
 * the side effects of its dependencies into account. So if A depends on B
 * (A -> B) and both have side effects, loading A triggers effects AB.
 *
 * Now from the previous step we know that each chunk is uniquely determine by
 * the entry points that depend on it and cause it to load, which we will all
 * its dependent entry points.
 *
 * E.g. if X -> A and Y -> A, then the dependent entry points of A are XY.
 * Starting from that idea, we can determine a set of chunks—and thus a set
 * of side effects—that must have been triggered if a certain chunk has been
 * loaded. Basically, it is the intersection of all chunks loaded by the
 * dependent entry points of a given chunk. We call the corresponding side
 * effects the correlated side effects of that chunk.
 *
 * Example:
 * X -> ABC, Y -> ADE, A-> F, B -> D
 * Then taking dependencies into account, X -> ABCDF, Y -> ADEF
 * The intersection is ADF. So we know that when A is loaded, D and F must also
 * be in memory even though neither D nor A is a dependency of the other.
 * If all have side effects, we call ADF the correlated side effects of A. The
 * correlated side effects need to remain constant when merging chunks.
 *
 * In contrast, we have the dependency side effects of A, which represents
 * the side effects we trigger if we directly load A. In this example, the
 * dependency side effects are AF.
 * For entry chunks, dependency and correlated side effects are the same.
 *
 * With these concepts, merging chunks is allowed if the correlated side effects
 * of each entry do not change. Thus, we are allowed to merge two chunks if
 * a) the dependency side effects of each chunk are a subset of the correlated
 *    side effects of the other chunk, so no additional side effects are
 *    triggered for any entry, or
 * b) The signature of chunk A is a subset of the signature of chunk B while the
 *    dependency side effects of A are a subset of the correlated side effects
 *    of B. Because in that scenario, whenever A is loaded, B is loaded as well.
 *    But there are cases when B is loaded where A is not loaded. So if we merge
 *    the chunks, all dependency side effects of A will be added to the
 *    correlated side effects of B, and as the latter is not allowed to change,
 *    the former need to be a subset of the latter.
 *
 * Another consideration when merging small chunks into other chunks is to avoid
 * that too much additional code is loaded. This is achieved when the dependent
 * entries of the small chunk are a subset of the dependent entries of the other
 * chunk. Because then when the small chunk is loaded, the other chunk was
 * loaded/in memory anyway, so at most when the other chunk is loaded, the
 * additional size of the small chunk is loaded unnecessarily.
 *
 * So the algorithm performs merges in two passes:
 * 1. First we try to merge small chunks A only into other chunks B if the
 *    dependent entries of A are a subset of the dependent entries of B and the
 *    dependency side effects of A are a subset of the correlated side effects
 *    of B.
 * 2. Only then for all remaining small chunks, we look for arbitrary merges
 *    following the above rules (a) and (b), starting with the smallest chunks
 *    to look for possible merge targets.
 */
function getOptimizedChunks(
	chunkModulesBySignature: { [chunkSignature: string]: Module[] },
	numberOfEntries: number,
	minChunkSize: number
) {
	timeStart('optimize chunks', 3);
	const chunkPartition = getPartitionedChunks(
		chunkModulesBySignature,
		numberOfEntries,
		minChunkSize
	);
	if (chunkPartition.small.size > 0) {
		mergeChunks(chunkPartition, minChunkSize);
	}
	timeEnd('optimize chunks', 3);
	return [...chunkPartition.small, ...chunkPartition.big];
}

const CHAR_DEPENDENT = 'X';
const CHAR_INDEPENDENT = '_';

function getPartitionedChunks(
	chunkModulesBySignature: { [chunkSignature: string]: Module[] },
	numberOfEntries: number,
	minChunkSize: number
): ChunkPartition {
	const smallChunks: ChunkDescription[] = [];
	const bigChunks: ChunkDescription[] = [];
	const chunkByModule = new Map<Module, ChunkDescription>();
	const sideEffectsByEntry: Set<string>[] = [];
	for (let index = 0; index < numberOfEntries; index++) {
		sideEffectsByEntry.push(new Set());
	}
	for (const [signature, modules] of Object.entries(chunkModulesBySignature)) {
		const dependentEntries = new Set<number>();
		for (let position = 0; position < numberOfEntries; position++) {
			if (signature[position] === CHAR_DEPENDENT) {
				dependentEntries.add(position);
			}
		}
		const chunkDescription: ChunkDescription = {
			correlatedSideEffects: new Set(),
			dependencies: new Set(),
			dependentChunks: new Set(),
			dependentEntries,
			modules,
			pure: true,
			sideEffects: new Set(),
			size: 0
		};
		let size = 0;
		let pure = true;
		for (const module of modules) {
			chunkByModule.set(module, chunkDescription);
			pure &&= !module.hasEffects();
			// Unfortunately, we cannot take tree-shaking into account here because
			// rendering did not happen yet
			size += module.originalCode.length;
		}
		chunkDescription.pure = pure;
		chunkDescription.size = size;
		if (!pure) {
			for (const entryIndex of dependentEntries) {
				sideEffectsByEntry[entryIndex].add(signature);
			}
			// In the beginning, each chunk is only its own side effect. After
			// merging, additional side effects can accumulate.
			chunkDescription.sideEffects.add(signature);
		}
		(size < minChunkSize ? smallChunks : bigChunks).push(chunkDescription);
	}
	sortChunksAndAddDependenciesAndEffects(
		[bigChunks, smallChunks],
		chunkByModule,
		sideEffectsByEntry
	);
	return {
		big: new Set(bigChunks),
		small: new Set(smallChunks)
	};
}

function sortChunksAndAddDependenciesAndEffects(
	chunkLists: ChunkDescription[][],
	chunkByModule: Map<Module, ChunkDescription>,
	sideEffectsByEntry: Set<string>[]
) {
	for (const chunks of chunkLists) {
		chunks.sort(compareChunkSize);
		for (const chunk of chunks) {
			const { dependencies, modules, correlatedSideEffects, dependentEntries } = chunk;
			for (const module of modules) {
				for (const dependency of module.getDependenciesToBeIncluded()) {
					const dependencyChunk = chunkByModule.get(dependency as Module);
					if (dependencyChunk && dependencyChunk !== chunk) {
						dependencies.add(dependencyChunk);
						dependencyChunk.dependentChunks.add(chunk);
					}
				}
			}
			let firstEntry = true;
			// Correlated side effects is the intersection of all entry side effects
			for (const entryIndex of dependentEntries) {
				const entryEffects = sideEffectsByEntry[entryIndex];
				if (firstEntry) {
					for (const sideEffect of entryEffects) {
						correlatedSideEffects.add(sideEffect);
						firstEntry = false;
					}
				} else {
					for (const sideEffect of correlatedSideEffects) {
						if (!entryEffects.has(sideEffect)) {
							correlatedSideEffects.delete(sideEffect);
						}
					}
				}
			}
		}
	}
}

function compareChunkSize(
	{ size: sizeA }: ChunkDescription,
	{ size: sizeB }: ChunkDescription
): number {
	return sizeA - sizeB;
}

function mergeChunks(chunkPartition: ChunkPartition, minChunkSize: number) {
	for (const onlySubsetMerge of [true, false]) {
		for (const mergedChunk of chunkPartition.small) {
			let closestChunk: ChunkDescription | null = null;
			let closestChunkDistance = Infinity;
			const { modules, pure, size } = mergedChunk;
			for (const targetChunk of concatLazy([chunkPartition.small, chunkPartition.big])) {
				if (mergedChunk === targetChunk) continue;
				const distance = getChunkEntryDistance(mergedChunk, targetChunk, onlySubsetMerge);
				if (
					distance < closestChunkDistance &&
					isValidMerge(mergedChunk, targetChunk, onlySubsetMerge)
				) {
					isValidMerge(mergedChunk, targetChunk, onlySubsetMerge);
					if (distance === 1) {
						closestChunk = targetChunk;
						break;
					}
					closestChunk = targetChunk;
					closestChunkDistance = distance;
				}
			}
			if (closestChunk) {
				chunkPartition.small.delete(mergedChunk);
				getChunksInPartition(closestChunk, minChunkSize, chunkPartition).delete(closestChunk);
				closestChunk.modules.push(...modules);
				closestChunk.size += size;
				closestChunk.pure &&= pure;
				const {
					correlatedSideEffects,
					dependencies,
					dependentChunks,
					dependentEntries,
					sideEffects
				} = closestChunk;
				for (const sideEffect of correlatedSideEffects) {
					if (!mergedChunk.correlatedSideEffects.has(sideEffect)) {
						correlatedSideEffects.delete(sideEffect);
					}
				}
				for (const entry of mergedChunk.dependentEntries) {
					dependentEntries.add(entry);
				}
				for (const sideEffect of mergedChunk.sideEffects) {
					sideEffects.add(sideEffect);
				}
				for (const dependency of mergedChunk.dependencies) {
					dependencies.add(dependency);
					dependency.dependentChunks.delete(mergedChunk);
					dependency.dependentChunks.add(closestChunk);
				}
				for (const dependentChunk of mergedChunk.dependentChunks) {
					dependentChunks.add(dependentChunk);
					dependentChunk.dependencies.delete(mergedChunk);
					dependentChunk.dependencies.add(closestChunk);
				}
				dependencies.delete(closestChunk);
				getChunksInPartition(closestChunk, minChunkSize, chunkPartition).add(closestChunk);
			}
		}
	}
}

// Merging will not produce cycles if none of the direct non-merged dependencies
// of a chunk have the other chunk as a transitive dependency
function isValidMerge(
	mergedChunk: ChunkDescription,
	targetChunk: ChunkDescription,
	onlySubsetMerge: boolean
) {
	return !(
		hasTransitiveDependencyOrNonCorrelatedSideEffect(mergedChunk, targetChunk, true) ||
		hasTransitiveDependencyOrNonCorrelatedSideEffect(targetChunk, mergedChunk, !onlySubsetMerge)
	);
}

function hasTransitiveDependencyOrNonCorrelatedSideEffect(
	dependentChunk: ChunkDescription,
	dependencyChunk: ChunkDescription,
	checkSideEffects: boolean
) {
	const { correlatedSideEffects } = dependencyChunk;
	if (checkSideEffects) {
		for (const sideEffect of dependentChunk.sideEffects) {
			if (!correlatedSideEffects.has(sideEffect)) {
				return true;
			}
		}
	}
	const chunksToCheck = new Set(dependentChunk.dependencies);
	for (const { dependencies, sideEffects } of chunksToCheck) {
		for (const dependency of dependencies) {
			if (dependency === dependencyChunk) {
				return true;
			}
			chunksToCheck.add(dependency);
		}
		if (checkSideEffects) {
			for (const sideEffect of sideEffects) {
				if (!correlatedSideEffects.has(sideEffect)) {
					return true;
				}
			}
		}
	}
	return false;
}

function getChunksInPartition(
	chunk: ChunkDescription,
	minChunkSize: number,
	chunkPartition: ChunkPartition
): Set<ChunkDescription> {
	return chunk.size < minChunkSize ? chunkPartition.small : chunkPartition.big;
}

function getChunkEntryDistance(
	{ dependentEntries: sourceEntries }: ChunkDescription,
	{ dependentEntries: targetEntries }: ChunkDescription,
	enforceSubest: boolean
): number {
	let distance = 0;
	for (const entryIndex of targetEntries) {
		if (!sourceEntries.has(entryIndex)) {
			distance++;
		}
	}
	for (const entryIndex of sourceEntries) {
		if (!targetEntries.has(entryIndex)) {
			if (enforceSubest) {
				return Infinity;
			}
			distance++;
		}
	}
	return distance;
}
