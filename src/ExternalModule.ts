import ExternalVariable from './ast/variables/ExternalVariable';
import type { CustomPluginOptions, ModuleInfo, NormalizedInputOptions } from './rollup/types';
import { EMPTY_ARRAY } from './utils/blank';
import { makeLegal } from './utils/identifierHelpers';
import { LOGLEVEL_WARN } from './utils/logging';
import { logUnusedExternalImports } from './utils/logs';

export default class ExternalModule {
	readonly dynamicImporters: string[] = [];
	execIndex = Infinity;
	readonly exportedVariables = new Map<ExternalVariable, string>();
	readonly importers: string[] = [];
	readonly info: ModuleInfo;
	reexported = false;
	suggestedVariableName: string;
	used = false;

	private readonly declarations = new Map<string, ExternalVariable>();
	private mostCommonSuggestion = 0;
	private readonly nameSuggestions = new Map<string, number>();

	constructor(
		private readonly options: NormalizedInputOptions,
		public readonly id: string,
		moduleSideEffects: boolean | 'no-treeshake',
		meta: CustomPluginOptions,
		public readonly renormalizeRenderPath: boolean,
		attributes: Record<string, string>
	) {
		this.suggestedVariableName = makeLegal(id.split(/[/\\]/).pop()!);

		const { importers, dynamicImporters } = this;
		this.info = {
			ast: null,
			attributes,
			code: null,
			dynamicallyImportedIdResolutions: EMPTY_ARRAY,
			dynamicallyImportedIds: EMPTY_ARRAY,
			get dynamicImporters() {
				return dynamicImporters.sort();
			},
			exportedBindings: null,
			exports: null,
			hasDefaultExport: null,
			id,
			implicitlyLoadedAfterOneOf: EMPTY_ARRAY,
			implicitlyLoadedBefore: EMPTY_ARRAY,
			importedIdResolutions: EMPTY_ARRAY,
			importedIds: EMPTY_ARRAY,
			get importers() {
				return importers.sort();
			},
			isEntry: false,
			isExternal: true,
			isIncluded: null,
			meta,
			moduleSideEffects,
			syntheticNamedExports: false
		};
	}

	getVariableForExportName(name: string): [variable: ExternalVariable] {
		const declaration = this.declarations.get(name);
		if (declaration) return [declaration];
		const externalVariable = new ExternalVariable(this, name);

		this.declarations.set(name, externalVariable);
		this.exportedVariables.set(externalVariable, name);
		return [externalVariable];
	}

	suggestName(name: string): void {
		const value = (this.nameSuggestions.get(name) ?? 0) + 1;
		this.nameSuggestions.set(name, value);

		if (value > this.mostCommonSuggestion) {
			this.mostCommonSuggestion = value;
			this.suggestedVariableName = name;
		}
	}

	warnUnusedImports(): void {
		const unused = [...this.declarations]
			.filter(
				([name, declaration]) =>
					name !== '*' && !declaration.included && !this.reexported && !declaration.referenced
			)
			.map(([name]) => name);

		if (unused.length === 0) return;

		const importersSet = new Set<string>();
		for (const name of unused) {
			for (const importer of this.declarations.get(name)!.module.importers) {
				importersSet.add(importer);
			}
		}
		const importersArray = [...importersSet];
		this.options.onLog(LOGLEVEL_WARN, logUnusedExternalImports(this.id, unused, importersArray));
	}
}
