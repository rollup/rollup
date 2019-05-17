import { basename, extname, isAbsolute, relative } from './path';

export function getAliasName(id: string) {
	const base = basename(id);
	return base.substr(0, base.length - extname(id).length);
}

export default function relativeId(id: string) {
	if (typeof process === 'undefined' || !isAbsolute(id)) return id;
	return relative(process.cwd(), id);
}

export function isPlainName(name: string) {
	// not starting with "./", "/". "../"
	return !(
		name[0] === '/' ||
		(name[1] === '.' && (name[2] === '/' || (name[2] === '.' && name[3] === '/')))
	);
}
