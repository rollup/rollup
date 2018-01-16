import Chunk from "../../Chunk";
import Module from "../../Module";
import { GlobalsOption } from "../../rollup/index";
import ExternalModule from "../../ExternalModule";

export default function getGlobalNameMaker (globals: GlobalsOption, chunk: Chunk, fallback: string = null) {
	const fn = typeof globals === 'function' ? globals : (id: string) => globals[id];

	return function (module: Module | ExternalModule) {
		const name = fn(module.id);
		if (name) return name;

		if (Object.keys(module.declarations).length > 0) {
			chunk.graph.warn({
				code: 'MISSING_GLOBAL_NAME',
				source: module.id,
				guess: (<ExternalModule>module).name,
				message: `No name was provided for external module '${
					module.id
					}' in options.globals – guessing '${(<ExternalModule>module).name}'`
			});

			return (<ExternalModule>module).name;
		}

		return fallback;
	};
}
