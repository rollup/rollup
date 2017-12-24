import { OutputOptions } from "../../rollup/index";
import Bundle from "../../Bundle";

export default function getInteropBlock (bundle: Bundle, options: OutputOptions) {
	return bundle.externalModules
		.map(module => {
			if (!module.declarations.default || options.interop === false)
				return null;

			if (module.exportsNamespace) {
				return `${bundle.graph.varOrConst} ${module.name}__default = ${
					module.name
					}['default'];`;
			}

			if (module.exportsNames) {
				return `${bundle.graph.varOrConst} ${module.name}__default = 'default' in ${
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
