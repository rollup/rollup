import ExternalVariable from './ast/variables/ExternalVariable';
import {
	CustomPluginOptions,
	ModuleInfo,
	NormalizedInputOptions,
	NormalizedOutputOptions
} from './rollup/types';
import { EMPTY_ARRAY } from './utils/blank';
import { makeLegal } from './utils/identifierHelpers';
import { isAbsolute, normalize, relative } from './utils/path';

export default class ExternalModule {
	chunk: void;
	declarations: { [name: string]: ExternalVariable };
	defaultVariableName = '';
	dynamicImporters: string[] = [];
	execIndex: number;
	exportedVariables: Map<ExternalVariable, string>;
	importers: string[] = [];
	info: ModuleInfo;
	mostCommonSuggestion = 0;
	namespaceVariableName = '';
	nameSuggestions: { [name: string]: number };
	reexported = false;
	renderPath: string = undefined as any;
	renormalizeRenderPath = false;
	suggestedVariableName: string;
	used = false;
	variableName = '';

	constructor(
		private readonly options: NormalizedInputOptions,
		public readonly id: string,
		hasModuleSideEffects: boolean | 'no-treeshake',
		meta: CustomPluginOptions
	) {
		this.execIndex = Infinity;
		this.suggestedVariableName = makeLegal(id.split(/[\\/]/).pop()!);
		this.nameSuggestions = Object.create(null);
		this.declarations = Object.create(null);
		this.exportedVariables = new Map();

		const module = this;
		this.info = {
			ast: null,
			code: null,
			dynamicallyImportedIds: EMPTY_ARRAY,
			get dynamicImporters() {
				return module.dynamicImporters.sort();
			},
			hasModuleSideEffects,
			id,
			implicitlyLoadedAfterOneOf: EMPTY_ARRAY,
			implicitlyLoadedBefore: EMPTY_ARRAY,
			importedIds: EMPTY_ARRAY,
			get importers() {
				return module.importers.sort();
			},
			isEntry: false,
			isExternal: true,
			meta
		};
	}

	getVariableForExportName(name: string): ExternalVariable {
		let declaration = this.declarations[name];
		if (declaration) return declaration;

		this.declarations[name] = declaration = new ExternalVariable(this, name);
		this.exportedVariables.set(declaration, name);
		return declaration;
	}

	setRenderPath(options: NormalizedOutputOptions, inputBase: string) {
		this.renderPath =
			typeof options.paths === 'function' ? options.paths(this.id) : options.paths[this.id];
		if (!this.renderPath) {
			if (!isAbsolute(this.id)) {
				this.renderPath = this.id;
			} else {
				this.renderPath = normalize(relative(inputBase, this.id));
				this.renormalizeRenderPath = true;
			}
		}
		return this.renderPath;
	}

	suggestName(name: string) {
		if (!this.nameSuggestions[name]) this.nameSuggestions[name] = 0;
		this.nameSuggestions[name] += 1;

		if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
			this.mostCommonSuggestion = this.nameSuggestions[name];
			this.suggestedVariableName = name;
		}
	}

	warnUnusedImports() {
		const unused = Object.keys(this.declarations).filter(name => {
			if (name === '*') return false;
			const declaration = this.declarations[name];
			return !declaration.included && !this.reexported && !declaration.referenced;
		});

		if (unused.length === 0) return;

		const names =
			unused.length === 1
				? `'${unused[0]}' is`
				: `${unused
						.slice(0, -1)
						.map(name => `'${name}'`)
						.join(', ')} and '${unused.slice(-1)}' are`;

		this.options.onwarn({
			code: 'UNUSED_EXTERNAL_IMPORT',
			message: `${names} imported from external module '${this.id}' but never used`,
			names: unused,
			source: this.id
		});
	}
}
