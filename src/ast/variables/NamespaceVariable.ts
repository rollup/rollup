import Module, { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import Identifier from '../nodes/Identifier';
import Variable from './Variable';

export default class NamespaceVariable extends Variable {
	context: AstContext;
	declare isNamespace: true;
	module: Module;

	private memberVariables: { [name: string]: Variable } | null = null;
	private mergedNamespaces: Variable[] = [];
	private referencedEarly = false;
	private references: Identifier[] = [];
	private syntheticNamedExports: boolean | string;

	constructor(context: AstContext, syntheticNamedExports: boolean | string) {
		super(context.getModuleName());
		this.context = context;
		this.module = context.module;
		this.syntheticNamedExports = syntheticNamedExports;
	}

	addReference(identifier: Identifier): void {
		this.references.push(identifier);
		this.name = identifier.name;
	}

	getMemberVariables(): { [name: string]: Variable } {
		if (this.memberVariables) {
			return this.memberVariables;
		}
		const memberVariables: { [name: string]: Variable } = Object.create(null);
		for (const name of this.context.getExports().concat(this.context.getReexports())) {
			if (name[0] !== '*' && name !== this.module.info.syntheticNamedExports) {
				const exportedVariable = this.context.traceExport(name);
				if (exportedVariable) {
					memberVariables[name] = exportedVariable;
				}
			}
		}
		return (this.memberVariables = memberVariables);
	}

	include(): void {
		this.included = true;
		this.context.includeAllExports();
	}

	prepareNamespace(mergedNamespaces: Variable[]): void {
		this.mergedNamespaces = mergedNamespaces;
		const moduleExecIndex = this.context.getModuleExecIndex();
		for (const identifier of this.references) {
			if (identifier.context.getModuleExecIndex() <= moduleExecIndex) {
				this.referencedEarly = true;
				break;
			}
		}
	}

	// TODO Lukas looks for ES6 simplifications: shorthand etc
	// TODO Lukas namespaceToStringTag should move into the generated code options
	renderBlock(options: RenderOptions): string {
		const {
			exportNamesByVariable,
			format,
			freeze,
			indent: t,
			namespaceToStringTag,
			snippets: { _, n, s },
			varOrConst
		} = options;

		const memberVariables = this.getMemberVariables();
		const members = Object.entries(memberVariables).map(([name, original]) => {
			if (this.referencedEarly || original.isReassigned) {
				return `${t}get ${name}${_}()${_}{${_}return ${original.getName()}${s}${_}}`;
			}

			const safeName = RESERVED_NAMES[name] ? `'${name}'` : name;

			return `${t}${safeName}: ${original.getName()}`;
		});

		if (namespaceToStringTag) {
			members.unshift(`${t}[Symbol.toStringTag]:${_}'Module'`);
		}

		const needsObjectAssign = this.mergedNamespaces.length > 0 || this.syntheticNamedExports;
		if (!needsObjectAssign) members.unshift(`${t}__proto__:${_}null`);

		let output = `{${n}${members.join(`,${n}`)}${n}}`;
		if (needsObjectAssign) {
			const assignmentArgs: string[] = ['/*#__PURE__*/Object.create(null)'];
			if (this.mergedNamespaces.length > 0) {
				assignmentArgs.push(...this.mergedNamespaces.map(variable => variable.getName()));
			}
			if (this.syntheticNamedExports) {
				assignmentArgs.push(this.module.getSyntheticNamespace().getName());
			}
			if (members.length > 0) {
				assignmentArgs.push(output);
			}
			// TODO Lukas Object.assign is not really ES5? Also, can we just spread instead? Search for other usages?
			output = `/*#__PURE__*/Object.assign(${assignmentArgs.join(`,${_}`)})`;
		}
		if (freeze) {
			output = `/*#__PURE__*/Object.freeze(${output})`;
		}

		const name = this.getName();
		output = `${varOrConst} ${name}${_}=${_}${output};`;

		if (format === 'system' && exportNamesByVariable.has(this)) {
			output += `${n}${getSystemExportStatement([this], options)};`;
		}

		return output;
	}

	renderFirst(): boolean {
		return this.referencedEarly;
	}
}

NamespaceVariable.prototype.isNamespace = true;
