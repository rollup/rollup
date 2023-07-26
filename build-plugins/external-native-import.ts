import type { Plugin } from 'rollup';

export function externalNativeImport(): Plugin {
	return {
		name: 'copy-native-files',
		async resolveId(id, importer) {
			if (id.endsWith('/native/lib.js')) {
				return {
					...(await this.resolve(id, importer, { skipSelf: true }))!,
					external: 'relative'
				};
			}
		}
	};
}
