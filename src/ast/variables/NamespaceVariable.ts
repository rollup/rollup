import Module, { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';
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

	renderBlock(options: RenderOptions): string {
		const {
			exportNamesByVariable,
			format,
			freeze,
			indent: t,
			namespaceToStringTag,
			snippets: { _, cnst, getObject, getPropertyAccess, n, s }
		} = options;
		const memberVariables = this.getMemberVariables();
		const members: [key: string | null, value: string][] = Object.entries(memberVariables).map(
			([name, original]) => {
				if (this.referencedEarly || original.isReassigned) {
					return [
						null,
						`get ${name}${_}()${_}{${_}return ${original.getName(getPropertyAccess)}${s}${_}}`
					];
				}

				return [name, original.getName(getPropertyAccess)];
			}
		);

		if (namespaceToStringTag) {
			members.unshift([null, `[Symbol.toStringTag]:${_}'Module'`]);
		}

		const needsObjectAssign = this.mergedNamespaces.length > 0 || this.syntheticNamedExports;
		if (!needsObjectAssign) members.unshift([null, `__proto__:${_}null`]);

		let output = getObject(members, { indent: t, lineBreaks: true });
		if (needsObjectAssign) {
			const assignmentArgs: string[] = ['/*#__PURE__*/Object.create(null)'];
			if (this.mergedNamespaces.length > 0) {
				assignmentArgs.push(
					...this.mergedNamespaces.map(variable => variable.getName(getPropertyAccess))
				);
			}
			if (this.syntheticNamedExports) {
				assignmentArgs.push(this.module.getSyntheticNamespace().getName(getPropertyAccess));
			}
			if (members.length > 0) {
				assignmentArgs.push(output);
			}
			// TODO Lukas Object.assign is not really ES5?
			output = `/*#__PURE__*/Object.assign(${assignmentArgs.join(`,${_}`)})`;
		}
		if (freeze) {
			output = `/*#__PURE__*/Object.freeze(${output})`;
		}

		const name = this.getName(getPropertyAccess);
		output = `${cnst} ${name}${_}=${_}${output};`;

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
