import ExternalModule from './ExternalModule';
import { NormalizedOutputOptions } from './rollup/types';
import { escapeId } from './utils/escapeId';
import { normalize, relative } from './utils/path';
import { getImportPath } from './utils/relativeId';

export default class ExternalChunk {
	defaultVariableName = '';
	id: string;
	namespaceVariableName = '';
	suggestedVariableName: string;
	variableName = '';

	private fileName: string | null = null;
	private renormalizeRenderPath: boolean;

	constructor(
		module: ExternalModule,
		private options: NormalizedOutputOptions,
		private inputBase: string
	) {
		this.id = module.id;
		this.renormalizeRenderPath = module.renormalizeRenderPath;
		this.suggestedVariableName = module.suggestedVariableName;
	}

	getFileName(): string {
		if (this.fileName) {
			return this.fileName;
		}
		const { paths } = this.options;
		return (this.fileName =
			(typeof paths === 'function' ? paths(this.id) : paths[this.id]) ||
			(this.renormalizeRenderPath ? normalize(relative(this.inputBase, this.id)) : this.id));
	}

	getImportPath(importer: string): string {
		return escapeId(
			this.renormalizeRenderPath
				? getImportPath(importer, this.getFileName(), this.options.format === 'amd', false)
				: this.getFileName()
		);
	}
}
