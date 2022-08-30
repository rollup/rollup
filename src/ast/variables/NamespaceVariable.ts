import Module, { AstContext } from '../../Module';
import { getToStringTagValue, MERGE_NAMESPACES_VARIABLE } from '../../utils/interopHelpers';
import type { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import type Identifier from '../nodes/Identifier';
import { LiteralValueOrUnknown } from '../nodes/shared/Expression';
import type ChildScope from '../scopes/ChildScope';
import Variable from './Variable';

export default class NamespaceVariable extends Variable {
	context: AstContext;
	declare isNamespace: true;
	module: Module;

	private memberVariables: { [name: string]: Variable } | null = null;
	private mergedNamespaces: readonly Variable[] = [];
	private referencedEarly = false;
	private references: Identifier[] = [];

	constructor(context: AstContext) {
		super(context.getModuleName());
		this.context = context;
		this.module = context.module;
	}

	addReference(identifier: Identifier): void {
		this.references.push(identifier);
		this.name = identifier.name;
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		// This can only happen for Symbol.toStringTag right now
		return 'Module';
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

	hasEffectsOnInteractionAtPath(): boolean {
		return false;
	}

	include(): void {
		this.included = true;
		this.context.includeAllExports();
	}

	prepare(accessedGlobalsByScope: Map<ChildScope, Set<string>>): void {
		if (this.mergedNamespaces.length > 0) {
			this.module.scope.addAccessedGlobals([MERGE_NAMESPACES_VARIABLE], accessedGlobalsByScope);
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
		members.unshift([null, `__proto__:${_}null`]);

		let output = getObject(members, { lineBreakIndent: { base: '', t } });
		if (this.mergedNamespaces.length > 0) {
			const assignmentArgs = this.mergedNamespaces.map(variable =>
				variable.getName(getPropertyAccess)
			);
			output = `/*#__PURE__*/${MERGE_NAMESPACES_VARIABLE}(${output},${_}[${assignmentArgs.join(
				`,${_}`
			)}])`;
		} else {
			// The helper to merge namespaces will also take care of freezing and toStringTag
			if (namespaceToStringTag) {
				output = `/*#__PURE__*/Object.defineProperty(${output},${_}Symbol.toStringTag,${_}${getToStringTagValue(
					getObject
				)})`;
			}
			if (freeze) {
				output = `/*#__PURE__*/Object.freeze(${output})`;
			}
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

	setMergedNamespaces(mergedNamespaces: readonly Variable[]): void {
		this.mergedNamespaces = mergedNamespaces;
		const moduleExecIndex = this.context.getModuleExecIndex();
		for (const identifier of this.references) {
			if (identifier.context.getModuleExecIndex() <= moduleExecIndex) {
				this.referencedEarly = true;
				break;
			}
		}
	}
}

NamespaceVariable.prototype.isNamespace = true;
