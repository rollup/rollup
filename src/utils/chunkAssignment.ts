import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getNewSet, getOrCreate } from './getOrCreate';
import { concatLazy } from './iterators';
import { timeEnd, timeStart } from './timers';

type ChunkDefinitions = { alias: string | null; modules: Module[] }[];

interface ChunksBySignature {
	[chunkSignature: string]: ModulesWithDependentEntries;
}
interface ModulesWithDependentEntries {
	dependentEntries: Set<number>;
	modules: Module[];
}

/**
 * At its core, the algorithm first starts from each static or dynamic entry
 * point and then assigns that entry point to all modules than can be reached
 * via static imports. We call this the *dependent entry points* of that
 * module.
 *
 * Then we group all modules with the same dependent entry points into chunks
 * as those modules will always be loaded together.
 *
 * One non-trivial optimization we can apply is that dynamic entries are
 * different from static entries in so far as when a dynamic import occurs,
 * some
 * modules are already in memory. If some of these modules are also
 * dependencies
 * of the dynamic entry, then it does not make sense to create a separate chunk
 * for them. Instead, the dynamic import target can load them from the
 * importing
 * chunk.
 *
 * With regard to chunking, if B is implicitly loaded after A, then this can be
 * handled the same way as if there was a dynamic import A => B.
 *
 * Example:
 * Assume A -> B (A imports B), A => C (A dynamically imports C) and C -> B.
 * Then the initial algorithm would assign A into the A chunk, C into the C
 * chunk and B into the AC chunk, i.e. the chunk with the dependent entry
 * points
 * A and C.
 * However we know that C can only be loaded from A, so A and its dependency B
 * must already be in memory when C is loaded. So it is enough to create only
 * two chunks A containing [AB] and C containing [C].
 *
 * So we do not assign the dynamic entry C as dependent entry point to modules
 * that are already loaded.
 *
 * In a more complex example, let us assume that we have entry points X and Y.
 * Further, let us assume
 * X -> A, X -> B, X -> C,
 * Y -> A, Y -> B,
 * A => D,
 * D -> B, D -> C
 * So without dynamic import optimization, the dependent entry points are
 * A: XY, B: DXY, C: DX, D: D, X: X, Y: Y,
 * so we would for now create six chunks.
 *
 * Now D is loaded only after A is loaded. But A is loaded if either X is
 * loaded
 * or Y is loaded. So the modules that are already in memory when D is loaded
 * are the intersection of all modules that X depends on with all modules that
 * Y
 * depends on, which in this case are the modules A and B.
 * We could also say they are all modules that have both X and Y as dependent
 * entry points.
 *
 * So we can remove D as dependent entry point from A and B, which means they
 * both now have only XY as dependent entry points and can be merged into the
 * same chunk.
 *
 * Now let us extend this to the most general case where we have several
 * dynamic
 * importers for one dynamic entry point.
 *
 * In the most general form, it works like this:
 * For each dynamic entry point, we have a number of dynamic importers, which
 * are the modules importing it. Using the previous ideas, we can determine
 * the modules already in memory for each dynamic importer by looking for all
 * modules that have all the dependent entry points of the dynamic importer as
 * dependent entry points.
 * So the modules that are guaranteed to be in memory when the dynamic entry
 * point is loaded are the intersection of the modules already in memory for
 * each dynamic importer.
 *
 * Assuming that A => D and B => D and A has dependent entry points XY and B
 * has
 * dependent entry points YZ, then the modules guaranteed to be in memory are
 * all modules that have at least XYZ as dependent entry points.
 * We call XYZ the *dynamically dependent entry points* of D.
 *
 * Now there is one last case to consider: If one of the dynamically dependent
 * entries is itself a dynamic entry, then any module is in memory that either
 * is a dependency of that dynamic entry or again has the dynamic dependent
 * entries of that dynamic entry as dependent entry points.
 *
 * A naive algorithm for this proved to be costly as it contained an O(n^3)
 * complexity with regard to dynamic entries that blew up for very large
 * projects.
 *
 * If we have an efficient way to do Set operations, an alternative approach
 * would be to instead collect already loaded modules per dynamic entry. And as
 * all chunks from the initial grouping would behave the same, we can instead
 * collect already loaded chunks for a performance improvement.
 *
 * To do that efficiently, need
 * - a Map of dynamic imports per dynamic entry, which contains all dynamic
 *   imports that can be triggered by a dynamic entry
 * - a Map of static dependencies per entry
 * - a Map of already loaded chunks per entry that we initially populate with
 *   empty Sets for static entries and Sets containing all entries for dynamic
 *   entries
 *
 * For efficient operations, we assign each entry a numerical index and
 * represent Sets of Chunks as BigInt values where each chunk corresponds to a
 * bit index. Then thw last two maps can be represented as arrays of BigInt
 * values.
 *
 * Then we iterate through each dynamic entry. We set the already loaded modules
 * to the intersection of the previously already loaded modules with the union
 * of the already loaded modules of that chunk with its static dependencies.
 *
 * If the already loaded modules changed, then we use the Map of dynamic imports
 * per dynamic entry to marks all dynamic entry dependencies as "dirty" and put
 * them back into the iteration. As an additional optimization, we note for
 * each dynamic entry which dynamic dependent entries have changed and only
 * intersect those entries again on subsequent interations.
 *
 * Then we remove the dynamic entries from the list of dependent entries for
 * those chunks that are already loaded for that dynamic entry and create
 * another round of chunks.
 */
export function getChunkAssignments(
	entries: ReadonlyArray<Module>,
	manualChunkAliasByEntry: ReadonlyMap<Module, string>,
	minChunkSize: number
): ChunkDefinitions {
	const { chunkDefinitions, modulesInManualChunks } =
		getChunkDefinitionsFromManualChunks(manualChunkAliasByEntry);
	const {
		allEntries,
		dependentEntriesByModule,
		dynamicallyDependentEntriesByDynamicEntry,
		dynamicImportsByEntry
	} = analyzeModuleGraph(entries);

	// Each chunk is identified by its position in this array
	const initialChunks = Object.values(
		getChunksBySignature(
			getModulesWithDependentEntries(dependentEntriesByModule, modulesInManualChunks)
		)
	);

	// This mutates initialChunks but also clears
	// dynamicallyDependentEntriesByDynamicEntry as side effect
	removeUnnecessaryDependentEntries(
		initialChunks,
		dynamicallyDependentEntriesByDynamicEntry,
		dynamicImportsByEntry,
		allEntries
	);

	chunkDefinitions.push(
		...createChunks(allEntries, getChunksBySignature(initialChunks), minChunkSize)
	);
	return chunkDefinitions;
}

function getChunkDefinitionsFromManualChunks(
	manualChunkAliasByEntry: ReadonlyMap<Module, string>
): { chunkDefinitions: ChunkDefinitions; modulesInManualChunks: Set<Module> } {
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
	return { chunkDefinitions, modulesInManualChunks };
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
	allEntries: ReadonlyArray<Module>;
	dependentEntriesByModule: Map<Module, Set<number>>;
	dynamicImportsByEntry: ReadonlyArray<ReadonlySet<number>>;
	dynamicallyDependentEntriesByDynamicEntry: Map<number, Set<number>>;
} {
	const dynamicEntryModules = new Set<Module>();
	const dependentEntriesByModule: Map<Module, Set<number>> = new Map();
	const dynamicImportModulesByEntry: Set<Module>[] = [];
	const allEntriesSet = new Set(entries);
	let entryIndex = 0;
	for (const currentEntry of allEntriesSet) {
		const dynamicImportsForCurrentEntry = new Set<Module>();
		dynamicImportModulesByEntry.push(dynamicImportsForCurrentEntry);
		const modulesToHandle = new Set([currentEntry]);
		for (const module of modulesToHandle) {
			getOrCreate(dependentEntriesByModule, module, getNewSet<number>).add(entryIndex);
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule)) {
					modulesToHandle.add(dependency);
				}
			}
			for (const { resolution } of module.dynamicImports) {
				if (
					resolution instanceof Module &&
					resolution.includedDynamicImporters.length > 0 &&
					!allEntriesSet.has(resolution)
				) {
					dynamicEntryModules.add(resolution);
					allEntriesSet.add(resolution);
					dynamicImportsForCurrentEntry.add(resolution);
				}
			}
			for (const dependency of module.implicitlyLoadedBefore) {
				if (!allEntriesSet.has(dependency)) {
					dynamicEntryModules.add(dependency);
					allEntriesSet.add(dependency);
				}
			}
		}
		entryIndex++;
	}
	const allEntries = [...allEntriesSet];
	const { dynamicEntries, dynamicImportsByEntry } = getDynamicEntries(
		allEntries,
		dynamicEntryModules,
		dynamicImportModulesByEntry
	);
	return {
		allEntries,
		dependentEntriesByModule,
		dynamicallyDependentEntriesByDynamicEntry: getDynamicallyDependentEntriesByDynamicEntry(
			dependentEntriesByModule,
			dynamicEntries,
			allEntries
		),
		dynamicImportsByEntry
	};
}

function getDynamicEntries(
	allEntries: Module[],
	dynamicEntryModules: Set<Module>,
	dynamicImportModulesByEntry: Set<Module>[]
) {
	const entryIndexByModule = new Map<Module, number>();
	const dynamicEntries = new Set<number>();
	for (const [entryIndex, entry] of allEntries.entries()) {
		entryIndexByModule.set(entry, entryIndex);
		if (dynamicEntryModules.has(entry)) {
			dynamicEntries.add(entryIndex);
		}
	}
	const dynamicImportsByEntry: Set<number>[] = [];
	for (const dynamicImportModules of dynamicImportModulesByEntry) {
		const dynamicImports = new Set<number>();
		for (const dynamicEntry of dynamicImportModules) {
			dynamicImports.add(entryIndexByModule.get(dynamicEntry)!);
		}
		dynamicImportsByEntry.push(dynamicImports);
	}
	return { dynamicEntries, dynamicImportsByEntry };
}

function getDynamicallyDependentEntriesByDynamicEntry(
	dependentEntriesByModule: ReadonlyMap<Module, ReadonlySet<number>>,
	dynamicEntries: ReadonlySet<number>,
	allEntries: ReadonlyArray<Module>
): Map<number, Set<number>> {
	const dynamicallyDependentEntriesByDynamicEntry: Map<number, Set<number>> = new Map();
	for (const dynamicEntryIndex of dynamicEntries) {
		const dynamicallyDependentEntries = getOrCreate(
			dynamicallyDependentEntriesByDynamicEntry,
			dynamicEntryIndex,
			getNewSet<number>
		);
		const dynamicEntry = allEntries[dynamicEntryIndex];
		for (const importer of concatLazy([
			dynamicEntry.includedDynamicImporters,
			dynamicEntry.implicitlyLoadedAfter
		])) {
			for (const entry of dependentEntriesByModule.get(importer)!) {
				dynamicallyDependentEntries.add(entry);
			}
		}
	}
	return dynamicallyDependentEntriesByDynamicEntry;
}

function getChunksBySignature(
	modulesWithDependentEntries: Iterable<ModulesWithDependentEntries>
): ChunksBySignature {
	const chunkModules: ChunksBySignature = Object.create(null);
	for (const { dependentEntries, modules } of modulesWithDependentEntries) {
		let chunkSignature = 0n;
		for (const entryIndex of dependentEntries) {
			chunkSignature |= 1n << BigInt(entryIndex);
		}
		(chunkModules[String(chunkSignature)] ||= {
			dependentEntries: new Set(dependentEntries),
			modules: []
		}).modules.push(...modules);
	}
	return chunkModules;
}

function* getModulesWithDependentEntries(
	dependentEntriesByModule: Map<Module, Set<number>>,
	modulesInManualChunks: Set<Module>
) {
	for (const [module, dependentEntries] of dependentEntriesByModule) {
		if (!modulesInManualChunks.has(module)) {
			yield { dependentEntries, modules: [module] };
		}
	}
}

/**
 * This removes all unnecessary dynamic entries from the dependenEntries in its
 * first argument. It will also consume its second argument, so if
 * dynamicallyDependentEntriesByDynamicEntry is ever needed after this, we
 * should make a copy.
 */
function removeUnnecessaryDependentEntries(
	chunks: ModulesWithDependentEntries[],
	dynamicallyDependentEntriesByDynamicEntry: Map<number, Set<number>>,
	dynamicImportsByEntry: ReadonlyArray<ReadonlySet<number>>,
	allEntries: ReadonlyArray<Module>
) {
	// The indices correspond to the indices in allEntries. The chunks correspond
	// to bits in the bigint values where chunk 0 is the lowest bit.
	const staticDependenciesPerEntry: bigint[] = allEntries.map(() => 0n);
	const alreadyLoadedChunksPerEntry: bigint[] = allEntries.map((_entry, entryIndex) =>
		dynamicallyDependentEntriesByDynamicEntry.has(entryIndex) ? -1n : 0n
	);

	// This toggles the bits for each chunk that is a dependency of an entry
	let chunkMask = 1n;
	for (const { dependentEntries } of chunks) {
		for (const entryIndex of dependentEntries) {
			staticDependenciesPerEntry[entryIndex] |= chunkMask;
		}
		chunkMask <<= 1n;
	}

	// Warning: This will consume dynamicallyDependentEntriesByDynamicEntry.
	// If we no longer want this, we should make a copy here.
	const updatedDynamicallyDependentEntriesByDynamicEntry =
		dynamicallyDependentEntriesByDynamicEntry;
	for (const [
		dynamicEntryIndex,
		updatedDynamicallyDependentEntries
	] of updatedDynamicallyDependentEntriesByDynamicEntry) {
		updatedDynamicallyDependentEntriesByDynamicEntry.delete(dynamicEntryIndex);
		const previousLoadedModules = alreadyLoadedChunksPerEntry[dynamicEntryIndex];
		let newLoadedModules = previousLoadedModules;
		for (const entryIndex of updatedDynamicallyDependentEntries) {
			newLoadedModules &=
				staticDependenciesPerEntry[entryIndex] | alreadyLoadedChunksPerEntry[entryIndex];
		}
		if (newLoadedModules !== previousLoadedModules) {
			alreadyLoadedChunksPerEntry[dynamicEntryIndex] = newLoadedModules;
			for (const dynamicImport of dynamicImportsByEntry[dynamicEntryIndex]) {
				getOrCreate(
					updatedDynamicallyDependentEntriesByDynamicEntry,
					dynamicImport,
					getNewSet<number>
				).add(dynamicEntryIndex);
			}
		}
	}

	// Remove entries from dependent entries if a chunk is already loaded without
	// that entry.
	chunkMask = 1n;
	for (const { dependentEntries } of chunks) {
		for (const entryIndex of dependentEntries) {
			if ((alreadyLoadedChunksPerEntry[entryIndex] & chunkMask) === chunkMask) {
				dependentEntries.delete(entryIndex);
			}
		}
		chunkMask <<= 1n;
	}
}

function createChunks(
	allEntries: ReadonlyArray<Module>,
	chunkModulesBySignature: ChunksBySignature,
	minChunkSize: number
): ChunkDefinitions {
	return minChunkSize === 0
		? Object.values(chunkModulesBySignature).map(({ modules }) => ({
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
 * the entry points that depend on it and cause it to load, which we will call
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
// TODO instead of picking the "closest" chunk, we could actually use a
//  technique similar to what we do for side effects to compare the size of the
//  static dependencies that are not part of the correlated dependencies
function getOptimizedChunks(
	chunkModulesBySignature: ChunksBySignature,
	numberOfEntries: number,
	minChunkSize: number
) {
	timeStart('optimize chunks', 3);
	const chunkPartition = getPartitionedChunks(
		chunkModulesBySignature,
		numberOfEntries,
		minChunkSize
	);
	console.log(
		'Before eliminating small chunks, there were\n',
		Object.keys(chunkModulesBySignature).length,
		'chunks, of which\n',
		chunkPartition.small.size,
		'were below minChunkSize.'
	);
	if (chunkPartition.small.size > 0) {
		mergeChunks(chunkPartition, minChunkSize);
	}
	console.log(
		'After merging chunks,\n',
		chunkPartition.small.size + chunkPartition.big.size,
		'chunks remain, of which\n',
		chunkPartition.small.size,
		'are below minChunkSize.'
	);
	timeEnd('optimize chunks', 3);
	return [...chunkPartition.small, ...chunkPartition.big];
}

function getPartitionedChunks(
	chunkModulesBySignature: ChunksBySignature,
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
	for (const [signature, { dependentEntries, modules }] of Object.entries(
		chunkModulesBySignature
	)) {
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
					}
					firstEntry = false;
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
	for (const allowArbitraryMerges of [false, true]) {
		for (const mergedChunk of chunkPartition.small) {
			let closestChunk: ChunkDescription | null = null;
			let closestChunkDistance = Infinity;
			const { modules, pure, size } = mergedChunk;
			for (const targetChunk of concatLazy([chunkPartition.small, chunkPartition.big])) {
				if (mergedChunk === targetChunk) continue;
				// If both chunks are small, we also allow for unrelated merges during
				// the first pass
				const onlySubsetMerge = !allowArbitraryMerges && targetChunk.size >= minChunkSize;
				const distance = getChunkEntryDistance(mergedChunk, targetChunk, onlySubsetMerge);
				if (
					distance < closestChunkDistance &&
					isValidMerge(mergedChunk, targetChunk, onlySubsetMerge)
				) {
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
				dependentChunks.delete(closestChunk);
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
