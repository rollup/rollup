import { basename, extname, isAbsolute, relative, resolve } from './path';

export function getAliasName(id: string) {
	const base = basename(id);
	return base.substr(0, base.length - extname(id).length);
}

export default function relativeId(id: string) {
	if (!isAbsolute(id)) return id;
	return relative(resolve(), id);
}

export function isPlainPathFragment(name: string, sanitizeFileName: (fileName: string) => string) {
	// not starting with "/", "./", "../"
	return (
		name[0] !== '/' &&
		!(name[0] === '.' && (name[1] === '/' || name[1] === '.')) &&
		sanitizeFileName(name) === name &&
		!isAbsolute(name)
	);
}
