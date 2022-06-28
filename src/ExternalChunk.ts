import ExternalModule from './ExternalModule';
import { NormalizedOutputOptions } from './rollup/types';
import { escapeId } from './utils/escapeId';
import { normalize, relative } from './utils/path';
import { getImportPath } from './utils/relativeId';

export default class ExternalChunk {
	defaultVariableName = '';
	id: string;
	namespaceVariableName = '';
	variableName = '';

	private fileName: string | null = null;

	constructor(
		private module: ExternalModule,
		private options: NormalizedOutputOptions,
		private inputBase: string
	) {
		this.id = module.id;
	}

	getImportPath(importer: string): { fileName: string; import: string } {
		const fileName = this.getFileName();
		return {
			fileName,
			import: escapeId(
				this.module.renormalizeRenderPath
					? getImportPath(importer, fileName, this.options.format === 'amd', false)
					: fileName
			)
		};
	}

	// TODO Lukas A fixed variable over a getter would also work as it is acalled often in deconflictChunk
	getSuggestedVariableName(): string {
		return this.module.suggestedVariableName;
	}

	private getFileName(): string {
		if (this.fileName) {
			return this.fileName;
		}
		const { paths } = this.options;
		return (this.fileName =
			(typeof paths === 'function' ? paths(this.id) : paths[this.id]) ||
			(this.module.renormalizeRenderPath ? normalize(relative(this.inputBase, this.id)) : this.id));
	}
}
