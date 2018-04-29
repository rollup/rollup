import { isAbsolute, relative, extname, basename } from './path';

export function getAliasName(resolved: string, unresolved?: string) {
	let alias = basename(unresolved || resolved);
	const ext = extname(resolved);
	if (alias.endsWith(ext)) alias = alias.substr(0, alias.length - ext.length);
	return alias;
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
