import ExternalModule from '../ExternalModule';
import Module from '../Module';
import relativeId from './relativeId';

interface OrderedExecutionUnit {
	execIndex: number;
}

const compareExecIndex = <T extends OrderedExecutionUnit>(unitA: T, unitB: T) =>
	unitA.execIndex > unitB.execIndex ? 1 : -1;

export function sortByExecutionOrder(units: OrderedExecutionUnit[]) {
	units.sort(compareExecIndex);
}

export function analyseModuleExecution(entryModules: Module[]) {
	let nextExecIndex = 0;
	const cyclePaths: string[][] = [];
	const analysedModules: { [id: string]: boolean } = {};
	const orderedModules: Module[] = [];
	const dynamicImports: Module[] = [];
	const parents: { [id: string]: string | null } = {};

	const analyseModule = (module: Module | ExternalModule) => {
		if (analysedModules[module.id]) return;

		if (module instanceof ExternalModule) {
			module.execIndex = nextExecIndex++;
			analysedModules[module.id] = true;
			return;
		}

		for (const dependency of module.dependencies) {
			if (dependency.id in parents) {
				if (!analysedModules[dependency.id]) {
					cyclePaths.push(getCyclePath(dependency.id, module.id, parents));
				}
				continue;
			}
			parents[dependency.id] = module.id;
			analyseModule(dependency);
		}

		for (const { resolution } of module.dynamicImports) {
			if (resolution instanceof Module && dynamicImports.indexOf(resolution) === -1) {
				dynamicImports.push(resolution);
			}
		}

		module.execIndex = nextExecIndex++;
		analysedModules[module.id] = true;
		orderedModules.push(module);
	};

	for (const curEntry of entryModules) {
		if (!parents[curEntry.id]) {
			parents[curEntry.id] = null;
			analyseModule(curEntry);
		}
	}
	for (const curEntry of dynamicImports) {
		if (!parents[curEntry.id]) {
			parents[curEntry.id] = null;
			analyseModule(curEntry);
		}
	}

	return { orderedModules, cyclePaths };
}

function getCyclePath(id: string, parentId: string, parents: { [id: string]: string | null }) {
	const path = [relativeId(id)];
	let curId = parentId;
	while (curId !== id) {
		path.push(relativeId(curId));
		curId = parents[curId] as string;
		if (!curId) break;
	}
	path.push(path[0]);
	path.reverse();
	return path;
}
