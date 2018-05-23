import { isAbsolute, relative, extname } from './path';

export const webExtensions = {
	'.js': true,
	'.mjs': true,
	'.jsx': true,
	'.ts': true
};

export function nameWithoutExtension(name: string) {
	const ext = extname(name);
	if (ext in webExtensions) return name.substr(0, name.length - ext.length);
	return name;
}

export default function relativeId(id: string) {
	if (typeof process === 'undefined' || !isAbsolute(id)) return id;
	return relative(process.cwd(), id);
}
