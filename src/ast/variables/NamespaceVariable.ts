import Module, { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import Identifier from '../nodes/Identifier';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from './Variable';

export default class NamespaceVariable extends Variable {
	context: AstContext;
	isNamespace!: true;
	module: Module;

	private memberVariables: { [name: string]: Variable } | null = null;
	private mergedNamespaces: Variable[] = [];
	private referencedEarly = false;
	private references: Identifier[] = [];
	private syntheticNamedExports: boolean;

	constructor(context: AstContext, syntheticNamedExports: boolean) {
		super(context.getModuleName());
		this.context = context;
		this.module = context.module;
		this.syntheticNamedExports = syntheticNamedExports;
	}

	addReference(identifier: Identifier) {
		this.references.push(identifier);
		this.name = identifier.name;
	}

	// This is only called if "UNKNOWN_PATH" is reassigned as in all other situations, either the
	// build fails due to an illegal namespace reassignment or MemberExpression already forwards
	// the reassignment to the right variable. This means we lost track of this variable and thus
	// need to reassign all exports.
	deoptimizePath() {
		const memberVariables = this.getMemberVariables();
		for (const key in memberVariables) {
			memberVariables[key].deoptimizePath(UNKNOWN_PATH);
		}
	}

	include() {
		if (!this.included) {
			this.included = true;
			const memberVariables = this.getMemberVariables();
			for (const identifier of this.references) {
				if (identifier.context.getModuleExecIndex() <= this.context.getModuleExecIndex()) {
					this.referencedEarly = true;
					break;
				}
			}
			this.mergedNamespaces = this.context.includeAndGetAdditionalMergedNamespaces();
			if (this.context.options.preserveModules) {
				for (const memberName in memberVariables) memberVariables[memberName].include();
			} else {
				for (const memberName in memberVariables)
					this.context.includeVariable(memberVariables[memberName]);
			}
		}
	}

	renderBlock(options: RenderOptions) {
		const _ = options.compact ? '' : ' ';
		const n = options.compact ? '' : '\n';
		const t = options.indent;

		const memberVariables = this.getMemberVariables();
		const members = Object.keys(memberVariables).map(name => {
			const original = memberVariables[name];

			if (this.referencedEarly || original.isReassigned) {
				return `${t}get ${name}${_}()${_}{${_}return ${original.getName()}${
					options.compact ? '' : ';'
				}${_}}`;
			}

			const safeName = RESERVED_NAMES[name] ? `'${name}'` : name;

			return `${t}${safeName}: ${original.getName()}`;
		});

		if (options.namespaceToStringTag) {
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
				assignmentArgs.push(this.module.getDefaultExport().getName());
			}
			if (members.length > 0) {
				assignmentArgs.push(output);
			}
			output = `/*#__PURE__*/Object.assign(${assignmentArgs.join(`,${_}`)})`;
		}
		if (options.freeze) {
			output = `/*#__PURE__*/Object.freeze(${output})`;
		}

		const name = this.getName();
		output = `${options.varOrConst} ${name}${_}=${_}${output};`;

		if (options.format === 'system' && options.exportNamesByVariable.has(this)) {
			output += `${n}${getSystemExportStatement([this], options)};`;
		}

		return output;
	}

	renderFirst() {
		return this.referencedEarly;
	}

	private getMemberVariables(): { [name: string]: Variable } {
		if (this.memberVariables) {
			return this.memberVariables;
		}
		const memberVariables = Object.create(null);
		for (const name of this.context.getExports().concat(this.context.getReexports())) {
			if (name[0] !== '*') {
				memberVariables[name] = this.context.traceExport(name);
			}
		}
		this.memberVariables = memberVariables;
		return (this.memberVariables = memberVariables);
	}
}

NamespaceVariable.prototype.isNamespace = true;
