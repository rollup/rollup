import RESERVED_NAMES from './RESERVED_NAMES';
import { toBase64 } from './base64';

export function getSafeName(
	baseName: string,
	usedNames: Set<string>,
	forbiddenNames: Set<string> | null
): string {
	let safeName = baseName;
	let count = 1;
	while (usedNames.has(safeName) || RESERVED_NAMES.has(safeName) || forbiddenNames?.has(safeName)) {
		safeName = `${baseName}$${toBase64(count++)}`;
	}
	usedNames.add(safeName);
	return safeName;
}
