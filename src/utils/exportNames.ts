import type Variable from '../ast/variables/Variable';
import { toBase64 } from './base64';
import RESERVED_NAMES from './RESERVED_NAMES';

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

// Names starting with "*" are used internally, e.g. "*" for namespaces and "*"
// followed by an id for namespaces reexported from external modules. To avoid
// conflicts, actual export names starting with "*" get an additional "*", and
// external ids starting with "*" or "\0" are prefixed with "\0".
export const escapeExportName = (name: string): string => (name[0] === '*' ? `*${name}` : name);

export const unescapeExportName = (name: string): string =>
	name.startsWith('**') ? name.slice(1) : name;

export const isNamespaceExportName = (name: string): boolean => name[0] === '*' && name[1] !== '*';

export const getExternalNamespaceExportName = (id: string): string =>
	id[0] === '*' || id[0] === '\0' ? `*\0${id}` : `*${id}`;

export const getExternalNamespaceId = (exportName: string): string =>
	exportName.slice(exportName[1] === '\0' ? 2 : 1);
