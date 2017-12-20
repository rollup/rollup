import { isAbsolute, relative } from './path';

export default function relativeId (id: string) {
	if (typeof process === 'undefined' || !isAbsolute(id)) return id;
	return relative(process.cwd(), id);
}
