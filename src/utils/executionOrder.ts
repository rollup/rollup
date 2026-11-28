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

// This process is currently faulty in so far as it only takes the first entry
// module into account and assumes that dynamic imports are imported in a
// certain order.
// A better algorithm would follow every possible execution path and mark which
// modules are executed before or after which other modules. THen the chunking
// would need to take care that in each chunk, all modules are always executed
// in the same sequence.

// Check if an ImportExpression is at the top level of a module
// (not nested inside any function)
function isTopLevelImport(node: { parent: any }): boolean {
	let parent = node.parent;
	while (parent) {
		// Check if parent is a function-like node by checking the type string
		// This covers FunctionDeclaration, FunctionExpression, ArrowFunctionExpression,
		// and class methods
		const type = parent.type as string;
		if (
			type === 'FunctionDeclaration' ||
			type === 'FunctionExpression' ||
			type === 'ArrowFunctionExpression'
		) {
			return false;
		}
		parent = parent.parent;
	}
	return true;
}

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
			for (const dynamicImport of module.dynamicImports) {
				if (dynamicImport.node.resolution instanceof Module) {
					// Only treat dynamic imports as synchronous if the import
					// expression is at the top level (not inside a function)
					// of a module that uses top-level await. Dynamic imports
					// inside functions are always async.
					if (
						isTopLevelImport(dynamicImport.node) &&
						dynamicImport.node.scope.context.usesTopLevelAwait
					) {
						handleSyncLoadedModule(dynamicImport.node.resolution, module);
					} else {
						dynamicImports.add(dynamicImport.node.resolution);
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
