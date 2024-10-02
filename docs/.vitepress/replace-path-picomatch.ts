import path from 'path';
import type { Plugin } from 'vite';

export function replacePathPicomatch(): Plugin {
	return {
		enforce: 'pre',
		load(id) {
			if (id === 'picomatch') {
				return 'export default {}';
			}
		},
		name: 'replace-picomatch',
		resolveId(source) {
			if (source === 'picomatch') {
				return { id: 'picomatch' };
			}
			if (source === 'path') {
				return path.resolve(__dirname, '../../browser/src/path.ts');
			}
		}
	};
}
