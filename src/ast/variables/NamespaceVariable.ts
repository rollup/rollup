import Module, { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import { InclusionContext } from '../ExecutionContext';
import Identifier from '../nodes/Identifier';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import Variable from './Variable';

export default class NamespaceVariable extends Variable {
	context: AstContext;
	isNamespace!: true;
	memberVariables: { [name: string]: Variable } = Object.create(null);
	module: Module;

	private containsExternalNamespace = false;
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
		for (const key in this.memberVariables) {
			this.memberVariables[key].deoptimizePath(UNKNOWN_PATH);
		}
	}

	getDefaultVariableName() {
		return this.context.traceExport('default').getName();
	}

	include(context: InclusionContext) {
		if (!this.included) {
			if (this.containsExternalNamespace) {
				this.context.error(
					{
						code: 'NAMESPACE_CANNOT_CONTAIN_EXTERNAL',
						id: this.module.id,
						message: `Cannot create an explicit namespace object for module "${this.context.getModuleName()}" because it contains a reexported external namespace`
					},
					undefined as any
				);
			}
			this.included = true;
			for (const identifier of this.references) {
				if (identifier.context.getModuleExecIndex() <= this.context.getModuleExecIndex()) {
					this.referencedEarly = true;
					break;
				}
			}
			if (this.context.preserveModules) {
				for (const memberName of Object.keys(this.memberVariables))
					this.memberVariables[memberName].include(context);
			} else {
				for (const memberName of Object.keys(this.memberVariables))
					this.context.includeVariable(context, this.memberVariables[memberName]);
			}
		}
	}

	initialise() {
		for (const name of this.context.getExports().concat(this.context.getReexports())) {
			if (name[0] === '*' && name.length > 1) this.containsExternalNamespace = true;
			this.memberVariables[name] = this.context.traceExport(name);
		}
	}

	renderBlock(options: RenderOptions) {
		const _ = options.compact ? '' : ' ';
		const n = options.compact ? '' : '\n';
		const t = options.indent;
		const syntheticNamedExports = this.syntheticNamedExports;

		const members = Object.keys(this.memberVariables)
			.filter(name => !syntheticNamedExports || name !== 'default')
			.map(name => {
				const original = this.memberVariables[name];

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

		const name = this.getName();

		let output = '';
		if (this.syntheticNamedExports && members.length === 0) {
			output = this.getDefaultVariableName();
		} else {
			members.unshift(`${t}__proto__:${_}null`);

			output = `{${n}${members.join(`,${n}`)}${n}}`;
			if (this.syntheticNamedExports) {
				output = `Object.assign(${output}, ${this.getDefaultVariableName()})`;
			}
			if (options.freeze) {
				output = `/*#__PURE__*/Object.freeze(${output})`;
			}
		}
		output = `${options.varOrConst} ${name}${_}=${_}${output};`;

		if (options.format === 'system' && this.exportName) {
			output += `${n}exports('${this.exportName}',${_}${name});`;
		}

		return output;
	}

	renderFirst() {
		return this.referencedEarly;
	}
}

NamespaceVariable.prototype.isNamespace = true;
