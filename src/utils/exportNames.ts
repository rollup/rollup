import Variable from '../ast/variables/Variable';
import { toBase64 } from './base64';
import { RESERVED_NAMES } from './reservedNames';

export function assignExportsToMangledNames(
	exports: Set<Variable>,
	exportsByName: Record<string, Variable>
) {
	let nameIndex = 0;
	for (const variable of exports) {
		const suggestedName = variable.name[0];
		if (!exportsByName[suggestedName]) {
			exportsByName[suggestedName] = variable;
		} else {
			let safeExportName: string;
			do {
				safeExportName = toBase64(++nameIndex);
				// skip past leading number identifiers
				if (safeExportName.charCodeAt(0) === 49 /* '1' */) {
					nameIndex += 9 * 64 ** (safeExportName.length - 1);
					safeExportName = toBase64(nameIndex);
				}
			} while (RESERVED_NAMES[safeExportName] || exportsByName[safeExportName]);
			exportsByName[safeExportName] = variable;
		}
	}
}

export function assignExportsToNames(
	exports: Set<Variable>,
	exportsByName: Record<string, Variable>
) {
	for (const variable of exports) {
		let nameIndex = 0;
		let safeExportName = variable.name;
		while (exportsByName[safeExportName]) {
			safeExportName = variable.name + '$' + ++nameIndex;
		}
		exportsByName[safeExportName] = variable;
	}
}
