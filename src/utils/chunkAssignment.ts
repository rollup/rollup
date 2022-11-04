import ExternalModule from '../ExternalModule';
import Module from '../Module';
import { getOrCreate } from './getOrCreate';
import relativeId from './relativeId';

type DependentModuleMap = Map<Module, Set<Module>>;
type ChunkDefinitions = { alias: string | null; modules: Module[] }[];

export function getChunkAssignments(
	entryModules: readonly Module[],
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

	const assignedEntryPointsByModule: DependentModuleMap = new Map();
	const { dependentEntryPointsByModule, dynamicEntryModules } = analyzeModuleGraph(entryModules);
	const dynamicallyDependentEntryPointsByDynamicEntry: DependentModuleMap =
		getDynamicDependentEntryPoints(dependentEntryPointsByModule, dynamicEntryModules);
	const staticEntries = new Set(entryModules);

	function assignEntryToStaticDependencies(
		entry: Module,
		dynamicDependentEntryPoints: ReadonlySet<Module> | null
	) {
		const modulesToHandle = new Set([entry]);
		for (const module of modulesToHandle) {
			const assignedEntryPoints = getOrCreate(assignedEntryPointsByModule, module, () => new Set());
			if (
				dynamicDependentEntryPoints &&
				areEntryPointsContainedOrDynamicallyDependent(
					dynamicDependentEntryPoints,
					dependentEntryPointsByModule.get(module)!
				)
			) {
				continue;
			} else {
				assignedEntryPoints.add(entry);
			}
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule || modulesInManualChunks.has(dependency))) {
					modulesToHandle.add(dependency);
				}
			}
		}
	}

	function areEntryPointsContainedOrDynamicallyDependent(
		entryPoints: ReadonlySet<Module>,
		containedIn: ReadonlySet<Module>
	): boolean {
		const entriesToCheck = new Set(entryPoints);
		for (const entry of entriesToCheck) {
			if (!containedIn.has(entry)) {
				if (staticEntries.has(entry)) return false;
				const dynamicallyDependentEntryPoints =
					dynamicallyDependentEntryPointsByDynamicEntry.get(entry)!;
				for (const dependentEntry of dynamicallyDependentEntryPoints) {
					entriesToCheck.add(dependentEntry);
				}
			}
		}
		return true;
	}

	for (const entry of entryModules) {
		if (!modulesInManualChunks.has(entry)) {
			assignEntryToStaticDependencies(entry, null);
		}
	}

	for (const entry of dynamicEntryModules) {
		if (!modulesInManualChunks.has(entry)) {
			assignEntryToStaticDependencies(
				entry,
				dynamicallyDependentEntryPointsByDynamicEntry.get(entry)!
			);
		}
	}

	chunkDefinitions.push(
		...createChunks(
			[...entryModules, ...dynamicEntryModules],
			assignedEntryPointsByModule,
			minChunkSize
		)
	);
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

function analyzeModuleGraph(entryModules: readonly Module[]): {
	dependentEntryPointsByModule: DependentModuleMap;
	dynamicEntryModules: Set<Module>;
} {
	const dynamicEntryModules = new Set<Module>();
	const dependentEntryPointsByModule: DependentModuleMap = new Map();
	const entriesToHandle = new Set(entryModules);
	for (const currentEntry of entriesToHandle) {
		const modulesToHandle = new Set([currentEntry]);
		for (const module of modulesToHandle) {
			getOrCreate(dependentEntryPointsByModule, module, () => new Set()).add(currentEntry);
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule)) {
					modulesToHandle.add(dependency);
				}
			}
			for (const { resolution } of module.dynamicImports) {
				if (resolution instanceof Module && resolution.includedDynamicImporters.length > 0) {
					dynamicEntryModules.add(resolution);
					entriesToHandle.add(resolution);
				}
			}
			for (const dependency of module.implicitlyLoadedBefore) {
				dynamicEntryModules.add(dependency);
				entriesToHandle.add(dependency);
			}
		}
	}
	return { dependentEntryPointsByModule, dynamicEntryModules };
}

function getDynamicDependentEntryPoints(
	dependentEntryPointsByModule: DependentModuleMap,
	dynamicEntryModules: ReadonlySet<Module>
): DependentModuleMap {
	const dynamicallyDependentEntryPointsByDynamicEntry: DependentModuleMap = new Map();
	for (const dynamicEntry of dynamicEntryModules) {
		const dynamicDependentEntryPoints = getOrCreate(
			dynamicallyDependentEntryPointsByDynamicEntry,
			dynamicEntry,
			() => new Set()
		);
		for (const importer of [
			...dynamicEntry.includedDynamicImporters,
			...dynamicEntry.implicitlyLoadedAfter
		]) {
			for (const entryPoint of dependentEntryPointsByModule.get(importer)!) {
				dynamicDependentEntryPoints.add(entryPoint);
			}
		}
	}
	return dynamicallyDependentEntryPointsByDynamicEntry;
}

interface ChunkDescription {
	modules: Module[];
	signature: string;
	size: number | null;
}

interface MergeableChunkDescription extends ChunkDescription {
	size: number;
}

function createChunks(
	allEntryPoints: readonly Module[],
	assignedEntryPointsByModule: DependentModuleMap,
	minChunkSize: number
): ChunkDefinitions {
	const chunkModulesBySignature = getChunkModulesBySignature(
		assignedEntryPointsByModule,
		allEntryPoints
	);
	printChunkModules('chunkModules', chunkModulesBySignature);
	if (minChunkSize === 0) {
		return Object.values(chunkModulesBySignature).map(modules => ({
			alias: null,
			modules
		}));
	}

	const { chunksToBeMerged, unmergeableChunks } = getMergeableChunks(
		chunkModulesBySignature,
		minChunkSize
	);
	// TODO Lukas merge unrelated chunks?
	console.log(
		'toBeMerged',
		[...chunksToBeMerged].map(({ modules, signature }) => ({
			modules: modules.map(relativeModuleId),
			signature
		}))
	);
	nextChunkToBeMerged: for (const sourceChunk of chunksToBeMerged) {
		console.log('check chunk', sourceChunk.signature, sourceChunk.modules.map(relativeModuleId));
		let closestChunk: ChunkDescription | null = null;
		let closestChunkDistance = Infinity;
		let reverseClosestChunkMerge = false;
		const { signature, size, modules } = sourceChunk;
		for (const targetChunk of chunksToBeMerged) {
			if (targetChunk !== sourceChunk) {
				let needsReversedMerge = false;
				let distance = getSignatureDistance(signature, targetChunk.signature);
				if (distance === Infinity) {
					needsReversedMerge = true;
					distance = getSignatureDistance(targetChunk.signature, signature);
				}
				if (distance === 1) {
					console.log(
						'merge into',
						targetChunk.signature,
						targetChunk.modules.map(relativeModuleId),
						targetChunk.size
					);
					targetChunk.size += size;
					targetChunk.modules.push(...modules);
					if (needsReversedMerge) {
						targetChunk.signature = signature;
					}
					chunksToBeMerged.delete(sourceChunk);
					if (targetChunk.size > minChunkSize) {
						chunksToBeMerged.delete(targetChunk);
						unmergeableChunks.push(targetChunk);
					}
					continue nextChunkToBeMerged;
				} else if (distance < closestChunkDistance) {
					closestChunk = targetChunk;
					closestChunkDistance = distance;
					reverseClosestChunkMerge = needsReversedMerge;
					throw new Error('10');
				} else {
					// throw new Error('11');
				}
			}
		}
		for (const targetChunk of unmergeableChunks) {
			const distance = getSignatureDistance(signature, targetChunk.signature);
			if (distance === 1) {
				targetChunk.modules.push(...modules);
				chunksToBeMerged.delete(sourceChunk);
				continue nextChunkToBeMerged;
			} else if (distance < closestChunkDistance) {
				closestChunk = targetChunk;
				closestChunkDistance = distance;
				reverseClosestChunkMerge = false;
			}
		}
		if (closestChunk) {
			closestChunk.modules.push(...modules);
			if (reverseClosestChunkMerge) {
				closestChunk.signature = signature;
				throw new Error('17');
			}
			chunksToBeMerged.delete(sourceChunk);
		} else {
			// throw new Error('19');
		}
	}
	return [...chunksToBeMerged, ...unmergeableChunks].map(({ modules }) => ({
		alias: null,
		modules
	}));
}

const CHAR_DEPENDENT = 'X';
const CHAR_INDEPENDENT = '_';
const CHAR_CODE_DEPENDENT = CHAR_DEPENDENT.charCodeAt(0);

function getChunkModulesBySignature(
	assignedEntryPointsByModule: Map<Module, Set<Module>>,
	allEntryPoints: readonly Module[]
) {
	const chunkModules: { [chunkSignature: string]: Module[] } = Object.create(null);
	for (const [module, assignedEntryPoints] of assignedEntryPointsByModule) {
		let chunkSignature = '';
		for (const entry of allEntryPoints) {
			chunkSignature += assignedEntryPoints.has(entry) ? CHAR_DEPENDENT : CHAR_INDEPENDENT;
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
	const chunksToBeMerged = new Set<MergeableChunkDescription>();
	const unmergeableChunks: ChunkDescription[] = [];
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
			chunksToBeMerged.add({ modules, signature, size });
			continue;
		}
		unmergeableChunks.push({ modules, signature, size: null });
	}
	return { chunksToBeMerged, unmergeableChunks };
}

function getSignatureDistance(sourceSignature: string, targetSignature: string): number {
	let distance = 0;
	const { length } = sourceSignature;
	for (let index = 0; index < length; index++) {
		const sourceValue = sourceSignature.charCodeAt(index);
		if (sourceValue !== targetSignature.charCodeAt(index)) {
			if (sourceValue === CHAR_CODE_DEPENDENT) {
				return Infinity;
			}
			distance++;
		}
	}
	return distance;
}

// DEBUGGING HELPERS, REMOVED BY TREE-SHAKING
/* eslint-disable @typescript-eslint/no-unused-vars */

const relativeModuleId = (module: Module) => relativeId(module.id);

const printModuleMap = (label: string, map: DependentModuleMap) =>
	console.log(
		label,
		Object.fromEntries(
			[...map].map(([module, dependentModules]) => [
				relativeModuleId(module),
				[...dependentModules].map(relativeModuleId)
			])
		)
	);

const printChunkModules = (label: string, modules: { [chunkSignature: string]: Module[] }) => {
	console.log(
		label,
		Object.fromEntries(
			Object.entries(modules).map(([signature, chunkModules]) => [
				signature,
				{
					hasEffects: chunkModules.some(module => module.hasEffects()),
					modules: chunkModules.map(relativeModuleId),
					size: chunkModules.reduce(
						(size, module) => size + module.magicString.toString().length,
						0
					)
				}
			])
		)
	);
};
