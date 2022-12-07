import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getOrCreate } from './getOrCreate';
import { concatLazy } from './iterators';
import { timeEnd, timeStart } from './timers';

type DependentModuleMap = Map<Module, Set<Module>>;
type ReadonlyDependentModuleMap = ReadonlyMap<Module, ReadonlySet<Module>>;
type ChunkDefinitions = { alias: string | null; modules: Module[] }[];

export function getChunkAssignments(
	entries: readonly Module[],
	manualChunkAliasByEntry: ReadonlyMap<Module, string>,
	minChunkSize: number
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
				dynamicallyDependentEntriesByDynamicEntry
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
	allEntries: Iterable<Module>;
	dependentEntriesByModule: DependentModuleMap;
	dynamicallyDependentEntriesByDynamicEntry: DependentModuleMap;
} {
	const dynamicEntries = new Set<Module>();
	const dependentEntriesByModule: DependentModuleMap = new Map();
	const allEntries = new Set(entries);
	for (const currentEntry of allEntries) {
		const modulesToHandle = new Set([currentEntry]);
		for (const module of modulesToHandle) {
			getOrCreate(dependentEntriesByModule, module, () => new Set()).add(currentEntry);
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
		allEntries,
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
			() => new Set()
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
	dynamicallyDependentEntriesByDynamicEntry: ReadonlyDependentModuleMap
) {
	const dynamicallyDependentEntries = dynamicallyDependentEntriesByDynamicEntry.get(entry);
	const modulesToHandle = new Set([entry]);
	for (const module of modulesToHandle) {
		const assignedEntries = getOrCreate(assignedEntriesByModule, module, () => new Set());
		if (
			dynamicallyDependentEntries &&
			isModuleAlreadyLoaded(
				dynamicallyDependentEntries,
				dependentEntriesByModule.get(module)!,
				staticEntries,
				dynamicallyDependentEntriesByDynamicEntry
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
	dynamicallyDependentEntriesByDynamicEntry: ReadonlyDependentModuleMap
): boolean {
	if (dynamicallyDependentEntries.size > MAX_ENTRIES_TO_CHECK_FOR_SHARED_DEPENDENCIES) {
		return false;
	}
	const entriesToCheck = new Set(dynamicallyDependentEntries);
	for (const entry of entriesToCheck) {
		if (!containedIn.has(entry)) {
			if (staticEntries.has(entry)) {
				return false;
			}
			const dynamicallyDependentEntries = dynamicallyDependentEntriesByDynamicEntry.get(entry)!;
			if (dynamicallyDependentEntries.size > MAX_ENTRIES_TO_CHECK_FOR_SHARED_DEPENDENCIES) {
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
	alias: null;
	modules: Module[];
	signature: string;
	size: number | null;
}

interface MergeableChunkDescription extends ChunkDescription {
	size: number;
}

function createChunks(
	allEntries: Iterable<Module>,
	assignedEntriesByModule: DependentModuleMap,
	minChunkSize: number
): ChunkDefinitions {
	const chunkModulesBySignature = getChunkModulesBySignature(assignedEntriesByModule, allEntries);
	return minChunkSize === 0
		? Object.values(chunkModulesBySignature).map(modules => ({
				alias: null,
				modules
		  }))
		: getOptimizedChunks(chunkModulesBySignature, minChunkSize);
}

function getOptimizedChunks(
	chunkModulesBySignature: { [chunkSignature: string]: Module[] },
	minChunkSize: number
) {
	timeStart('optimize chunks', 3);
	const { chunksToBeMerged, unmergeableChunks } = getMergeableChunks(
		chunkModulesBySignature,
		minChunkSize
	);
	for (const sourceChunk of chunksToBeMerged) {
		chunksToBeMerged.delete(sourceChunk);
		let closestChunk: ChunkDescription | null = null;
		let closestChunkDistance = Infinity;
		const { signature, size, modules } = sourceChunk;

		for (const targetChunk of concatLazy(chunksToBeMerged, unmergeableChunks)) {
			const distance = getSignatureDistance(
				signature,
				targetChunk.signature,
				!chunksToBeMerged.has(targetChunk)
			);
			if (distance === 1) {
				closestChunk = targetChunk;
				break;
			} else if (distance < closestChunkDistance) {
				closestChunk = targetChunk;
				closestChunkDistance = distance;
			}
		}
		if (closestChunk) {
			closestChunk.modules.push(...modules);
			if (chunksToBeMerged.has(closestChunk)) {
				closestChunk.signature = mergeSignatures(signature, closestChunk.signature);
				if ((closestChunk.size += size) > minChunkSize) {
					chunksToBeMerged.delete(closestChunk);
					unmergeableChunks.push(closestChunk);
				}
			}
		} else {
			unmergeableChunks.push(sourceChunk);
		}
	}
	timeEnd('optimize chunks', 3);
	return unmergeableChunks;
}

const CHAR_DEPENDENT = 'X';
const CHAR_INDEPENDENT = '_';
const CHAR_CODE_DEPENDENT = CHAR_DEPENDENT.charCodeAt(0);

function getChunkModulesBySignature(
	assignedEntriesByModule: ReadonlyDependentModuleMap,
	allEntries: Iterable<Module>
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

function getMergeableChunks(
	chunkModulesBySignature: { [chunkSignature: string]: Module[] },
	minChunkSize: number
) {
	const chunksToBeMerged = new Set() as Set<MergeableChunkDescription> & {
		has(chunk: unknown): chunk is MergeableChunkDescription;
	};
	const unmergeableChunks: ChunkDescription[] = [];
	const alias = null;
	for (const [signature, modules] of Object.entries(chunkModulesBySignature)) {
		let size = 0;
		checkModules: {
			for (const module of modules) {
				if (module.hasEffects()) {
					break checkModules;
				}
				size += module.magicString.toString().length;
				if (size > minChunkSize) {
					break checkModules;
				}
			}
			chunksToBeMerged.add({ alias, modules, signature, size });
			continue;
		}
		unmergeableChunks.push({ alias, modules, signature, size: null });
	}
	return { chunksToBeMerged, unmergeableChunks };
}

function getSignatureDistance(
	sourceSignature: string,
	targetSignature: string,
	enforceSubset: boolean
): number {
	let distance = 0;
	const { length } = sourceSignature;
	for (let index = 0; index < length; index++) {
		const sourceValue = sourceSignature.charCodeAt(index);
		if (sourceValue !== targetSignature.charCodeAt(index)) {
			if (enforceSubset && sourceValue === CHAR_CODE_DEPENDENT) {
				return Infinity;
			}
			distance++;
		}
	}
	return distance;
}

function mergeSignatures(sourceSignature: string, targetSignature: string): string {
	let signature = '';
	const { length } = sourceSignature;
	for (let index = 0; index < length; index++) {
		signature +=
			sourceSignature.charCodeAt(index) === CHAR_CODE_DEPENDENT ||
			targetSignature.charCodeAt(index) === CHAR_CODE_DEPENDENT
				? CHAR_DEPENDENT
				: CHAR_INDEPENDENT;
	}
	return signature;
}
