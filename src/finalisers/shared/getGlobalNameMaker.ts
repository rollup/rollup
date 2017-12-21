import Bundle from "../../Bundle";
import Module from "../../Module";
import { GlobalsOption } from "../../rollup/index";

export default function getGlobalNameMaker (globals: GlobalsOption, bundle: Bundle, fallback: string = null) {
	const fn = typeof globals === 'function' ? globals : (id: string) => globals[id];

	return function (module: Module) {
		const name = fn(module.id);
		if (name) return name;

		if (Object.keys(module.declarations).length > 0) {
			bundle.warn({
				code: 'MISSING_GLOBAL_NAME',
				source: module.id,
				guess: module.name,
				message: `No name was provided for external module '${
					module.id
					}' in options.globals – guessing '${module.name}'`
			});

			return module.name;
		}

		return fallback;
	};
}
