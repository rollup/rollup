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

export function isPlainName(name: string) {
	// not starting with "./", "/". "../"
	if (
		name[0] === '/' ||
		(name[1] === '.' && (name[2] === '/' || (name[2] === '.' && name[3] === '/')))
	)
		return false;
	// not a URL
	if (name.indexOf(':') !== -1) return false;
	return true;
}
