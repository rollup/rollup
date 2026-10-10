import type ExternalModule from '../ExternalModule';
import Module from '../Module';

interface OrderedExecutionUnit {
	execIndex: number;
}

const compareExecIndex = <T extends OrderedExecutionUnit>(unitA: T, unitB: T) =>
	unitA.execIndex > unitB.execIndex ? 1 : -1;

export function sortByExecutionOrder(units: OrderedExecutionUnit[]): void {
	units.sort(compareExecIndex);
}

// Imported let/const/class bindings are in the temporal dead zone until the
// module that initializes them has been evaluated. Cycles make the depth-first
// post-order place that initializer after a direct read. Reorder only when the
// read happens while the importing module is evaluated and a valid order exists.
export function reorderModulesToAvoidCircularTemporalDeadZone(modules: Module[]): void {
	if (!modules.some(module => module.cycles.size > 0)) return;

	const originalIndex = new Map<Module, number>();
	for (let index = 0; index < modules.length; index++) {
		originalIndex.set(modules[index], index);
	}

	const mustRunAfter = new Map<Module, Set<Module>>();
	const backwardEdges: [predecessor: Module, module: Module][] = [];
	const addPredecessor = (module: Module, predecessor: Module) => {
		if (module === predecessor || !originalIndex.has(predecessor)) return;
		let predecessors = mustRunAfter.get(module);
		if (!predecessors) {
			predecessors = new Set();
			mustRunAfter.set(module, predecessors);
		}
		if (!predecessors.has(predecessor)) {
			predecessors.add(predecessor);
			if (originalIndex.get(predecessor)! > originalIndex.get(module)!) {
				backwardEdges.push([predecessor, module]);
			}
		}
	};

	for (const module of modules) {
		for (const dependency of module.dependencies) {
			if (dependency instanceof Module && !sharesCycle(module, dependency)) {
				addPredecessor(module, dependency);
			}
		}
		if (module.cycles.size === 0) continue;
		module.forEachDirectlyEvaluatedBinding(variable => {
			if (!variable.definesTemporalDeadZone()) return;
			const owner = variable.module;
			if (!(owner instanceof Module) || owner === module || !sharesCycle(module, owner)) return;
			addPredecessor(module, owner);
		});
	}

	if (backwardEdges.length === 0) return;

	let sorted = stableTopologicalSort(modules, mustRunAfter, originalIndex);
	if (!sorted) {
		for (const [predecessor, module] of backwardEdges) {
			mustRunAfter.get(module)!.delete(predecessor);
		}
		sorted = stableTopologicalSort(modules, mustRunAfter, originalIndex);
	}
	if (!sorted) return;

	const executionIndices = modules.map(module => module.execIndex);
	for (let index = 0; index < sorted.length; index++) {
		sorted[index].execIndex = executionIndices[index];
	}
	modules.splice(0, modules.length, ...sorted);
}

function sharesCycle(left: Module, right: Module): boolean {
	if (left.cycles.size === 0 || right.cycles.size === 0) return false;
	const [smaller, larger] = left.cycles.size < right.cycles.size ? [left, right] : [right, left];
	for (const cycle of smaller.cycles) {
		if (larger.cycles.has(cycle)) return true;
	}
	return false;
}

function stableTopologicalSort(
	modules: readonly Module[],
	mustRunAfter: ReadonlyMap<Module, ReadonlySet<Module>>,
	originalIndex: ReadonlyMap<Module, number>
): Module[] | null {
	const indegree = new Map<Module, number>();
	const dependents = new Map<Module, Module[]>();
	for (const module of modules) {
		indegree.set(module, 0);
		dependents.set(module, []);
	}
	for (const [module, predecessors] of mustRunAfter) {
		for (const predecessor of predecessors) {
			if (!indegree.has(predecessor)) continue;
			indegree.set(module, indegree.get(module)! + 1);
			dependents.get(predecessor)!.push(module);
		}
	}

	const ready = new ModuleIndexHeap(originalIndex);
	for (const module of modules) {
		if (indegree.get(module) === 0) ready.push(module);
	}

	const sorted: Module[] = [];
	while (ready.size > 0) {
		const module = ready.pop();
		sorted.push(module);
		for (const dependent of dependents.get(module)!) {
			const remaining = indegree.get(dependent)! - 1;
			indegree.set(dependent, remaining);
			if (remaining === 0) ready.push(dependent);
		}
	}
	return sorted.length === modules.length ? sorted : null;
}

class ModuleIndexHeap {
	private readonly items: Module[] = [];

	constructor(private readonly originalIndex: ReadonlyMap<Module, number>) {}

	get size(): number {
		return this.items.length;
	}

	pop(): Module {
		const items = this.items;
		const top = items[0];
		const last = items.pop()!;
		if (items.length > 0) {
			items[0] = last;
			this.bubbleDown(0);
		}
		return top;
	}

	push(module: Module): void {
		const items = this.items;
		items.push(module);
		this.bubbleUp(items.length - 1);
	}

	private bubbleDown(index: number): void {
		const items = this.items;
		const length = items.length;
		while (true) {
			const left = index * 2 + 1;
			if (left >= length) return;
			const right = left + 1;
			let child = left;
			if (right < length && this.isEarlier(items[right], items[left])) child = right;
			if (this.isEarlier(items[index], items[child])) return;
			[items[index], items[child]] = [items[child], items[index]];
			index = child;
		}
	}

	private bubbleUp(index: number): void {
		const items = this.items;
		while (index > 0) {
			const parent = (index - 1) >> 1;
			if (this.isEarlier(items[parent], items[index])) return;
			[items[parent], items[index]] = [items[index], items[parent]];
			index = parent;
		}
	}

	private isEarlier(left: Module, right: Module): boolean {
		return this.originalIndex.get(left)! < this.originalIndex.get(right)!;
	}
}

// This process is currently faulty in so far as it only takes the first entry
// module into account and assumes that dynamic imports are imported in a
// certain order.
// A better algorithm would follow every possible execution path and mark which
// modules are executed before or after which other modules. THen the chunking
// would need to take care that in each chunk, all modules are always executed
// in the same sequence.
export function analyseModuleExecution(entryModules: readonly Module[]): {
	cyclePaths: string[][];
	orderedModules: Module[];
} {
	let nextExecIndex = 0;
	const cyclePaths: string[][] = [];
	const analysedModules = new Set<Module | ExternalModule>();
	const dynamicImports = new Set<Module>();
	const parents = new Map<Module | ExternalModule, Module | null>();
	const orderedModules: Module[] = [];

	const handleSyncLoadedModule = (module: Module | ExternalModule, parent: Module) => {
		if (parents.has(module)) {
			if (!analysedModules.has(module)) {
				cyclePaths.push(getCyclePath(module as Module, parent, parents));
			}
			return;
		}
		parents.set(module, parent);
		analyseModule(module);
	};

	const analyseModule = (module: Module | ExternalModule) => {
		if (module instanceof Module) {
			for (const dependency of module.dependencies) {
				handleSyncLoadedModule(dependency, module);
			}

			for (const dependency of module.implicitlyLoadedBefore) {
				dynamicImports.add(dependency);
			}
			for (const {
				node: { resolution, scope }
			} of module.dynamicImports) {
				if (resolution instanceof Module) {
					if (scope.context.usesTopLevelAwait) {
						handleSyncLoadedModule(resolution, module);
					} else {
						dynamicImports.add(resolution);
					}
				}
			}
			orderedModules.push(module);
		}

		module.execIndex = nextExecIndex++;
		analysedModules.add(module);
	};

	for (const currentEntry of entryModules) {
		if (!parents.has(currentEntry)) {
			parents.set(currentEntry, null);
			analyseModule(currentEntry);
		}
	}
	for (const currentEntry of dynamicImports) {
		if (!parents.has(currentEntry)) {
			parents.set(currentEntry, null);
			analyseModule(currentEntry);
		}
	}

	return { cyclePaths, orderedModules };
}

function getCyclePath(
	module: Module,
	parent: Module,
	parents: ReadonlyMap<Module | ExternalModule, Module | null>
): string[] {
	const cycleSymbol = Symbol(module.id);
	const path = [module.id];
	let nextModule = parent;
	module.cycles.add(cycleSymbol);
	while (nextModule !== module) {
		nextModule.cycles.add(cycleSymbol);
		path.push(nextModule.id);
		nextModule = parents.get(nextModule)!;
	}
	path.push(path[0]);
	path.reverse();
	return path;
}
