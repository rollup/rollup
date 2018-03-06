import { GlobalsOption } from '../../rollup/index';
import Graph from '../../Graph';
import { ModuleDeclarationDependency } from '../../Chunk';

export default function getGlobalNameMaker(
	globals: GlobalsOption,
	graph: Graph,
	fallback: string = null
) {
	const fn = typeof globals === 'function' ? globals : (id: string) => globals[id];

	return function(dependency: ModuleDeclarationDependency) {
		const name = fn(dependency.id);
		if (name) return name;

		if (dependency.exportsDefault || dependency.exportsNames || dependency.exportsNamespace) {
			graph.warn({
				code: 'MISSING_GLOBAL_NAME',
				source: module.id,
				guess: dependency.name,
				message: `No name was provided for external module '${
					module.id
				}' in options.globals – guessing '${dependency.name}'`
			});

			return dependency.name;
		}

		return fallback;
	};
}
