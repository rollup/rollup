import ExternalModule from '../ExternalModule';
import Module from '../Module';

type DependentModuleMap<T = Module> = Map<Module, Set<T>>;

export function getChunkAssignments(
	entryModules: Module[],
	manualChunkEntries: Record<string, Module[]>,
	manualChunkAliasByEntry: Map<Module, string>
): { chunks: Module[][]; manualChunks: Record<string, Module[]> } {
	// TODO Lukas would it be enough to just have a Set of which modules have an alias?
	const manualChunkAliasByModule = new Map<Module, string>(manualChunkAliasByEntry);
	const manualChunks = Object.create(null);
	for (const chunkName of Object.keys(manualChunkEntries)) {
		const manualChunkModules = (manualChunks[chunkName] = []);
		for (const entry of manualChunkEntries[chunkName]) {
			addStaticDependenciesToManualChunk(
				entry,
				chunkName,
				manualChunkModules,
				manualChunkAliasByModule
			);
		}
	}

	const assignedEntryPointsByModule: DependentModuleMap<Module | string> = new Map();
	const { dependentEntryPointsByModule, dynamicEntryModules } = analyzeModuleGraph(
		entryModules,
		manualChunkAliasByModule
	);
	const dynamicallyDependentEntryPointsByDynamicEntry: DependentModuleMap = getDynamicDependentEntryPoints(
		dependentEntryPointsByModule,
		dynamicEntryModules
	);
	const staticEntries = new Set(entryModules);

	function assignEntryToStaticDependencies(
		entry: Module,
		dynamicDependentEntryPoints: Set<Module> | null,
		assignedEntry: Module | string = entry
	) {
		const modulesToHandle = new Set([entry]);
		for (const module of modulesToHandle) {
			const assignedEntryPoints = getDependentModules(assignedEntryPointsByModule, module);
			if (
				dynamicDependentEntryPoints &&
				areEntryPointsContainedOrDynamicallyDependent(
					dynamicDependentEntryPoints,
					dependentEntryPointsByModule.get(module)!
				)
			) {
				continue;
			} else {
				assignedEntryPoints.add(assignedEntry);
			}
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule || manualChunkAliasByModule.has(dependency))) {
					modulesToHandle.add(dependency);
				}
			}
		}
	}

	function areEntryPointsContainedOrDynamicallyDependent(
		entryPoints: Set<Module>,
		superSet: Set<Module>
	): boolean {
		const entriesToCheck = new Set(entryPoints);
		for (const entry of entriesToCheck) {
			if (!superSet.has(entry)) {
				if (staticEntries.has(entry)) return false;
				const dynamicDependentEntryPoints = dynamicallyDependentEntryPointsByDynamicEntry.get(
					entry
				)!;
				for (const dependentEntry of dynamicDependentEntryPoints) {
					entriesToCheck.add(dependentEntry);
				}
			}
		}
		return true;
	}

	for (const entry of entryModules) {
		if (!manualChunkAliasByModule.has(entry)) {
			assignEntryToStaticDependencies(entry, null);
		}
	}

	for (const entry of dynamicEntryModules) {
		if (!manualChunkAliasByModule.has(entry)) {
			assignEntryToStaticDependencies(
				entry,
				dynamicallyDependentEntryPointsByDynamicEntry.get(entry)!
			);
		}
	}

	return {
		chunks: createChunks(
			[...Object.keys(manualChunkEntries), ...entryModules, ...dynamicEntryModules],
			assignedEntryPointsByModule
		),
		manualChunks
	};
}

function addStaticDependenciesToManualChunk(
	entry: Module,
	manualChunkAlias: string,
	manualChunkModules: Module[],
	manualChunkAliasByModule: Map<Module, string>
) {
	const modulesToHandle = new Set([entry]);
	for (const module of modulesToHandle) {
		manualChunkAliasByModule.set(module, manualChunkAlias);
		manualChunkModules.push(module);
		for (const dependency of module.getDependenciesToBeIncluded()) {
			if (!(dependency instanceof ExternalModule || manualChunkAliasByModule.has(dependency))) {
				modulesToHandle.add(dependency);
			}
		}
	}
}

function analyzeModuleGraph(
	entryModules: Module[],
	manualChunkAliasByModule: Map<Module, string>
): {
	dependentEntryPointsByModule: DependentModuleMap;
	dynamicEntryModules: Set<Module>;
} {
	const dynamicEntryModules = new Set<Module>();
	const dependentEntryPointsByModule: DependentModuleMap = new Map();
	const entriesToHandle = new Set(entryModules);
	for (const currentEntry of entriesToHandle) {
		const modulesToHandle = new Set<Module>([currentEntry]);
		for (const module of modulesToHandle) {
			getDependentModules(dependentEntryPointsByModule, module).add(currentEntry);
			for (const dependency of module.getDependenciesToBeIncluded()) {
				if (!(dependency instanceof ExternalModule)) {
					modulesToHandle.add(dependency);
				}
			}
			for (const { resolution } of module.dynamicImports) {
				if (
					resolution instanceof Module &&
					resolution.includedDynamicImporters.length > 0 &&
					!manualChunkAliasByModule.has(resolution)
				) {
					dynamicEntryModules.add(resolution);
					entriesToHandle.add(resolution);
				}
			}
			for (const dependency of module.implicitlyLoadedBefore) {
				if (!manualChunkAliasByModule.has(dependency)) {
					dynamicEntryModules.add(dependency);
					entriesToHandle.add(dependency);
				}
			}
		}
	}
	return { dependentEntryPointsByModule, dynamicEntryModules };
}

function getDependentModules<T>(moduleMap: DependentModuleMap<T>, module: Module): Set<T> {
	const dependentModules = moduleMap.get(module) || new Set();
	moduleMap.set(module, dependentModules);
	return dependentModules;
}

function getDynamicDependentEntryPoints(
	dependentEntryPointsByModule: DependentModuleMap,
	dynamicEntryModules: Set<Module>
): DependentModuleMap {
	const dynamicallyDependentEntryPointsByDynamicEntry: DependentModuleMap = new Map();
	for (const dynamicEntry of dynamicEntryModules) {
		const dynamicDependentEntryPoints = getDependentModules(
			dynamicallyDependentEntryPointsByDynamicEntry,
			dynamicEntry
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

function createChunks(
	allEntryPoints: (Module | string)[],
	assignedEntryPointsByModule: DependentModuleMap<Module | string>
) {
	const chunkModules: { [chunkSignature: string]: Module[] } = Object.create(null);
	for (const [module, assignedEntryPoints] of assignedEntryPointsByModule) {
		let chunkSignature = '';
		for (const entry of allEntryPoints) {
			chunkSignature += assignedEntryPoints.has(entry) ? 'X' : '_';
		}
		const chunk = chunkModules[chunkSignature];
		if (chunk) {
			chunk.push(module);
		} else {
			chunkModules[chunkSignature] = [module];
		}
	}
	return Object.keys(chunkModules).map(chunkSignature => chunkModules[chunkSignature]);
}
