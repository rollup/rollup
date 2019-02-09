import { toBase64 } from './base64';
import { INTEROP_DEFAULT_VARIABLE, MISSING_EXPORT_SHIM_VARIABLE } from './variableNames';

const RESERVED_NAMES: { [name: string]: true } = {
	[MISSING_EXPORT_SHIM_VARIABLE]: true,
	[INTEROP_DEFAULT_VARIABLE]: true,
	exports: true,
	module: true
};

export function getSafeName(baseName: string, usedNames: Set<string>): string {
	let safeName = baseName;
	let count = 1;
	while (usedNames.has(safeName) || RESERVED_NAMES[safeName]) {
		safeName = `${baseName}$${toBase64(count++)}`;
	}
	usedNames.add(safeName);
	return safeName;
}
