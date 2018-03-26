import { makeLegal } from './utils/identifierHelpers';
import ExternalVariable from './ast/variables/ExternalVariable';
import Graph from './Graph';
import Variable from './ast/variables/Variable';
import { OutputOptions } from './rollup';
import { isAbsolute, resolve, dirname, normalize, relative, isRelative } from './utils/path';

export default class ExternalModule {
	private graph: Graph;
	chunk: void;
	declarations: { [name: string]: ExternalVariable };
	exportsNames: boolean;
	exportsNamespace: boolean;
	id: string;
	renderPath: string;
	isExternal: true;
	isEntryPoint: false;
	name: string;
	mostCommonSuggestion: number;
	nameSuggestions: { [name: string]: number };
	reexported: boolean;
	used: boolean;
	execIndex: number;

	constructor({ graph, id }: { graph: Graph; id: string }) {
		this.graph = graph;
		this.id = id;
		this.renderPath = undefined;

		const parts = id.split(/[\\/]/);
		this.name = makeLegal(parts.pop());

		this.nameSuggestions = Object.create(null);
		this.mostCommonSuggestion = 0;

		this.isExternal = true;
		this.used = false;
		this.declarations = Object.create(null);

		this.exportsNames = false;
	}

	setRenderPath(options: OutputOptions, inputPath: string) {
		if (typeof options.paths === 'function') {
			let outPath = options.paths(this.id);
			if (outPath) {
				this.renderPath = outPath;
				return;
			}
		} else if (options.paths && options.paths.hasOwnProperty(this.id)) {
			this.renderPath = options.paths[this.id];
			return;
		}

		if (isAbsolute(this.id)) {
			let outDir: string;
			if (options.dir) outDir = resolve(options.dir);
			else if (options.file) outDir = dirname(resolve(options.file));
			else outDir = dirname(inputPath);
			const relativeToEntry = normalize(relative(outDir, this.id));
			this.renderPath = isRelative(relativeToEntry) ? relativeToEntry : `./${relativeToEntry}`;
		} else {
			this.renderPath = this.id;
		}
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
		const unused = Object.keys(this.declarations)
			.filter(name => name !== '*')
			.filter(name => !this.declarations[name].included && !this.declarations[name].reexported);

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

	traceExport(name: string): Variable {
		if (name !== 'default' && name !== '*') this.exportsNames = true;
		if (name === '*') this.exportsNamespace = true;

		return this.declarations[name] || (this.declarations[name] = new ExternalVariable(this, name));
	}
}
