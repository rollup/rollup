import { isAbsolute, relative } from './path';

export const jsExts = ['.js', '.mjs'];

export function nameWithoutExtension(name: string) {
	for (let ext of jsExts) {
		if (name.endsWith(ext)) return name.substr(0, name.length - ext.length);
	}
	return name;
}

export default function relativeId(id: string) {
	if (typeof process === 'undefined' || !isAbsolute(id)) return id;
	return relative(process.cwd(), id);
}
