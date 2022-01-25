import Variable from '../ast/variables/Variable';
import RESERVED_NAMES from './RESERVED_NAMES';
import { toBase64 } from './base64';

export function assignExportsToMangledNames(
	exports: ReadonlySet<Variable>,
	exportsByName: Map<string, Variable>,
	exportNamesByVariable: Map<Variable, string[]>
): void {
	let nameIndex = 0;
	for (const variable of exports) {
		let [exportName] = variable.name;
		if (exportsByName.has(exportName)) {
			do {
				exportName = toBase64(++nameIndex);
				// skip past leading number identifiers
				if (exportName.charCodeAt(0) === 49 /* '1' */) {
					nameIndex += 9 * 64 ** (exportName.length - 1);
					exportName = toBase64(nameIndex);
				}
			} while (RESERVED_NAMES.has(exportName) || exportsByName.has(exportName));
		}
		exportsByName.set(exportName, variable);
		exportNamesByVariable.set(variable, [exportName]);
	}
}

export function assignExportsToNames(
	exports: ReadonlySet<Variable>,
	exportsByName: Map<string, Variable>,
	exportNamesByVariable: Map<Variable, string[]>
): void {
	for (const variable of exports) {
		let nameIndex = 0;
		let exportName = variable.name;
		while (exportsByName.has(exportName)) {
			exportName = variable.name + '$' + ++nameIndex;
		}
		exportsByName.set(exportName, variable);
		exportNamesByVariable.set(variable, [exportName]);
	}
}
