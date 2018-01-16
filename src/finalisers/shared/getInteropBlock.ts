import { OutputOptions } from "../../rollup/index";
import Chunk from "../../Chunk";

export default function getInteropBlock (chunk: Chunk, options: OutputOptions) {
	return chunk.externalModules
		.map(module => {
			if (!module.declarations.default || options.interop === false)
				return null;

			if (module.exportsNamespace) {
				return `${chunk.graph.varOrConst} ${module.name}__default = ${
					module.name
					}['default'];`;
			}

			if (module.exportsNames) {
				return `${chunk.graph.varOrConst} ${module.name}__default = 'default' in ${
					module.name
					} ? ${module.name}['default'] : ${module.name};`;
			}

			return `${module.name} = ${module.name} && ${
				module.name
				}.hasOwnProperty('default') ? ${module.name}['default'] : ${
				module.name
				};`;
		})
		.filter(Boolean)
		.join('\n');
}
