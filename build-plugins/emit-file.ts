import type { Plugin } from 'rollup';

const EMIT_PREFIX = 'emit:';

export default function emitFile(): Plugin {
	return {
		load(id) {
			if (id.startsWith(EMIT_PREFIX)) {
				const entryId = id.slice(EMIT_PREFIX.length);
				const referenceId = this.emitFile({
					id: entryId,
					type: 'chunk'
				});
				return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
			}
		},
		name: 'emit-file',
		resolveFileUrl({ moduleId, relativePath, format }) {
			if (moduleId.startsWith(EMIT_PREFIX)) {
				return format === 'cjs'
					? `__dirname + '/${relativePath}'`
					: `new URL('${relativePath}', import.meta.url)`;
			}
		},
		async resolveId(source, importer) {
			if (source.startsWith(EMIT_PREFIX)) {
				return `${EMIT_PREFIX}${
					(await this.resolve(source.slice(EMIT_PREFIX.length), importer))!.id
				}`;
			}
		}
	};
}
