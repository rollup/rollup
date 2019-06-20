import ExternalVariable from './ast/variables/ExternalVariable';
import Graph from './Graph';
import { OutputOptions } from './rollup/types';
import { makeLegal } from './utils/identifierHelpers';
import { isAbsolute, normalize, relative } from './utils/path';

export default class ExternalModule {
	chunk: void;
	declarations: { [name: string]: ExternalVariable };
	execIndex: number;
	exportedVariables: Map<ExternalVariable, string>;
	exportsNames = false;
	exportsNamespace = false;
	id: string;
	moduleSideEffects: boolean;
	mostCommonSuggestion = 0;
	nameSuggestions: { [name: string]: number };
	reexported = false;
	renderPath: string = undefined as any;
	renormalizeRenderPath = false;
	used = false;
	variableName: string;

	private graph: Graph;

	constructor(graph: Graph, id: string, moduleSideEffects: boolean) {
		this.graph = graph;
		this.id = id;
		this.execIndex = Infinity;
		this.moduleSideEffects = moduleSideEffects;

		const parts = id.split(/[\\/]/);
		this.variableName = makeLegal(parts.pop() as string);

		this.nameSuggestions = Object.create(null);
		this.declarations = Object.create(null);
		this.exportedVariables = new Map();
	}

	getVariableForExportName(name: string, _isExportAllSearch?: boolean): ExternalVariable {
		if (name === '*') {
			this.exportsNamespace = true;
		} else if (name !== 'default') {
			this.exportsNames = true;
		}

		let declaration = this.declarations[name];
		if (declaration) return declaration;

		this.declarations[name] = declaration = new ExternalVariable(this, name);
		this.exportedVariables.set(declaration, name);
		return declaration;
	}

	setRenderPath(options: OutputOptions, inputBase: string) {
		this.renderPath = '';
		if (options.paths) {
			this.renderPath =
				typeof options.paths === 'function' ? options.paths(this.id) : options.paths[this.id];
		}
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
			this.variableName = name;
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

		this.graph.warn({
			code: 'UNUSED_EXTERNAL_IMPORT',
			message: `${names} imported from external module '${this.id}' but never used`,
			names: unused,
			source: this.id
		});
	}
}
