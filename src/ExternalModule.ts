import ExternalVariable from './ast/variables/ExternalVariable';
import {
	CustomPluginOptions,
	ModuleInfo,
	NormalizedInputOptions,
	NormalizedOutputOptions
} from './rollup/types';
import { EMPTY_ARRAY } from './utils/blank';
import { makeLegal } from './utils/identifierHelpers';
import { normalize, relative } from './utils/path';
import { printQuotedStringList } from './utils/printStringList';
import relativeId from './utils/relativeId';

export default class ExternalModule {
	declarations: { [name: string]: ExternalVariable } = Object.create(null);
	defaultVariableName = '';
	dynamicImporters: string[] = [];
	execIndex = Infinity;
	exportedVariables = new Map<ExternalVariable, string>();
	importers: string[] = [];
	info: ModuleInfo;
	mostCommonSuggestion = 0;
	nameSuggestions: { [name: string]: number } = Object.create(null);
	namespaceVariableName = '';
	reexported = false;
	renderPath: string = undefined as never;
	suggestedVariableName: string;
	used = false;
	variableName = '';

	constructor(
		private readonly options: NormalizedInputOptions,
		public readonly id: string,
		hasModuleSideEffects: boolean | 'no-treeshake',
		meta: CustomPluginOptions,
		public renormalizeRenderPath: boolean
	) {
		this.suggestedVariableName = makeLegal(id.split(/[\\/]/).pop()!);

		const { importers, dynamicImporters } = this;
		this.info = {
			ast: null,
			code: null,
			dynamicallyImportedIds: EMPTY_ARRAY,
			get dynamicImporters() {
				return dynamicImporters.sort();
			},
			hasModuleSideEffects,
			id,
			implicitlyLoadedAfterOneOf: EMPTY_ARRAY,
			implicitlyLoadedBefore: EMPTY_ARRAY,
			importedIds: EMPTY_ARRAY,
			get importers() {
				return importers.sort();
			},
			isEntry: false,
			isExternal: true,
			isIncluded: null,
			meta,
			syntheticNamedExports: false
		};
	}

	getVariableForExportName(name: string): ExternalVariable {
		let declaration = this.declarations[name];
		if (declaration) return declaration;

		this.declarations[name] = declaration = new ExternalVariable(this, name);
		this.exportedVariables.set(declaration, name);
		return declaration;
	}

	setRenderPath(options: NormalizedOutputOptions, inputBase: string): string {
		this.renderPath =
			typeof options.paths === 'function' ? options.paths(this.id) : options.paths[this.id];
		if (!this.renderPath) {
			this.renderPath = this.renormalizeRenderPath
				? normalize(relative(inputBase, this.id))
				: this.id;
		}
		return this.renderPath;
	}

	suggestName(name: string): void {
		if (!this.nameSuggestions[name]) this.nameSuggestions[name] = 0;
		this.nameSuggestions[name] += 1;

		if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
			this.mostCommonSuggestion = this.nameSuggestions[name];
			this.suggestedVariableName = name;
		}
	}

	warnUnusedImports(): void {
		const unused = Object.keys(this.declarations).filter(name => {
			if (name === '*') return false;
			const declaration = this.declarations[name];
			return !declaration.included && !this.reexported && !declaration.referenced;
		});
		if (unused.length === 0) return;

		const importersSet = new Set<string>();
		for (const name of unused) {
			const { importers } = this.declarations[name].module;
			for (const importer of importers) {
				importersSet.add(importer);
			}
		}
		const importersArray = [...importersSet];
		this.options.onwarn({
			code: 'UNUSED_EXTERNAL_IMPORT',
			message: `${printQuotedStringList(unused, ['is', 'are'])} imported from external module "${
				this.id
			}" but never used in ${printQuotedStringList(
				importersArray.map(importer => relativeId(importer))
			)}.`,
			names: unused,
			source: this.id,
			sources: importersArray
		});
	}
}
