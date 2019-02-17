import { toBase64 } from './base64';
import { NameCollection } from './reservedNames';

export function getSafeName(baseName: string, usedNames: NameCollection): string {
	let safeName = baseName;
	let count = 1;
	while (usedNames[safeName]) {
		safeName = `${baseName}$${toBase64(count++)}`;
	}
	usedNames[safeName] = true;
	return safeName;
}
