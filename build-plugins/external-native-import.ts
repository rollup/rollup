import type { Plugin } from 'rollup';

export function externalNativeImport(): Plugin {
	return {
		name: 'external-native-import',
		async resolveId(id, importer) {
			if (id.includes('/native')) {
				const resolved = await this.resolve(id, importer!, { skipSelf: true });
				const resolvedId = resolved!.id;
				return {
					external: 'relative',
					id: resolvedId.endsWith('.js') ? resolvedId : `${resolvedId}.js`
				};
			}
		}
	};
}
