import RESERVED_NAMES from './RESERVED_NAMES';
import { toBase64 } from './base64';
import { isValidIdentifier } from './isValidIdentifier';

export function getSafeName(
	baseName: string,
	usedNames: Set<string>,
	forbiddenNames: Set<string> | null
): string {
	const safeBase = isValidIdentifier(baseName) ? baseName : '_safe';
	let safeName = safeBase;
	let count = 1;
	while (usedNames.has(safeName) || RESERVED_NAMES.has(safeName) || forbiddenNames?.has(safeName)) {
		safeName = `${safeBase}$${toBase64(count++)}`;
	}
	usedNames.add(safeName);
	return safeName;
}
