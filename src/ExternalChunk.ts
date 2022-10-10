import ExternalModule from './ExternalModule';
import { ModuleInfo, NormalizedOutputOptions } from './rollup/types';
import { escapeId } from './utils/escapeId';
import { GenerateCodeSnippets } from './utils/generateCodeSnippets';
import { normalize, relative } from './utils/path';
import { getImportPath } from './utils/relativeId';

export default class ExternalChunk {
	defaultVariableName = '';
	id: string;
	namespaceVariableName = '';
	suggestedVariableName: string;
	variableName = '';

	private fileName: string | null = null;
	private importAssertions: string | null = null;
	private moduleInfo: ModuleInfo;
	private renormalizeRenderPath: boolean;

	constructor(
		module: ExternalModule,
		private options: NormalizedOutputOptions,
		private inputBase: string
	) {
		this.id = module.id;
		this.moduleInfo = module.info;
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

	getImportAssertions(snippets: GenerateCodeSnippets): string | null {
		return (this.importAssertions ||= formatAssertions(
			this.options.format === 'es' &&
				this.options.externalImportAssertions &&
				this.moduleInfo.assertions,
			snippets
		));
	}

	getImportPath(importer: string): string {
		return escapeId(
			this.renormalizeRenderPath
				? getImportPath(importer, this.getFileName(), this.options.format === 'amd', false)
				: this.getFileName()
		);
	}
}

function formatAssertions(
	assertions: Record<string, string> | null | void | false,
	{ getObject }: GenerateCodeSnippets
): string | null {
	if (!assertions) {
		return null;
	}
	const assertionEntries: [key: string, value: string][] = Object.entries(assertions).map(
		([key, value]) => [key, `'${value}'`]
	);
	if (assertionEntries.length) {
		return getObject(assertionEntries, { lineBreakIndent: null });
	}
	return null;
}
