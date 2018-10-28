import ExternalVariable from './ast/variables/ExternalVariable';
import Variable from './ast/variables/Variable';
import Graph from './Graph';
import { OutputOptions } from './rollup/types';
import { makeLegal } from './utils/identifierHelpers';
import { isAbsolute, normalize, relative } from './utils/path';

export default class ExternalModule {
	private graph: Graph;
	chunk: void;
	declarations: { [name: string]: ExternalVariable };
	exportedVariables: Map<ExternalVariable, string>;
	exportsNames = false;
	exportsNamespace: boolean = false;
	id: string;
	renderPath: string = undefined;
	renormalizeRenderPath = false;
	isExternal = true;
	isEntryPoint = false;
	name: string;
	mostCommonSuggestion: number = 0;
	nameSuggestions: { [name: string]: number };
	reexported: boolean = false;
	used = false;
	execIndex: number;

	constructor({ graph, id }: { graph: Graph; id: string }) {
		this.graph = graph;
		this.id = id;
		this.execIndex = Infinity;

		const parts = id.split(/[\\/]/);
		this.name = makeLegal(parts.pop());

		this.nameSuggestions = Object.create(null);
		this.declarations = Object.create(null);
		this.exportedVariables = new Map();
	}

	setRenderPath(options: OutputOptions, inputBase: string) {
		if (options.paths)
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
			this.name = name;
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
			source: this.id,
			names: unused,
			message: `${names} imported from external module '${this.id}' but never used`
		});
	}

	traceExport(name: string, _isExportAllSearch?: boolean): Variable {
		if (name !== 'default' && name !== '*') this.exportsNames = true;
		if (name === '*') this.exportsNamespace = true;

		let declaration = this.declarations[name];
		if (declaration) return declaration;

		this.declarations[name] = declaration = new ExternalVariable(this, name);
		this.exportedVariables.set(declaration, name);
		return declaration;
	}
}
