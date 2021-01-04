import Module, { AstContext } from '../../Module';
import { error, errSyntheticNamedExportsNeedNamespaceExport } from '../../utils/error';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	module: Module;
	syntheticNamespace: Variable;

	private baseVariable: Variable | null = null;

	constructor(context: AstContext, name: string, syntheticNamespace: Variable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.syntheticNamespace = syntheticNamespace;
	}

	getBaseVariable(): Variable {
		if (this.baseVariable) return this.baseVariable;
		let baseVariable = this.syntheticNamespace;
		const checkedVariables = new Set<Variable>();
		while (
			baseVariable instanceof ExportDefaultVariable ||
			baseVariable instanceof SyntheticNamedExportVariable
		) {
			checkedVariables.add(baseVariable);
			if (baseVariable instanceof ExportDefaultVariable) {
				const original = baseVariable.getOriginalVariable();
				if (original === baseVariable) break;
				baseVariable = original;
			}
			if (baseVariable instanceof SyntheticNamedExportVariable) {
				baseVariable = baseVariable.syntheticNamespace;
			}
			if (checkedVariables.has(baseVariable)) {
				return error(
					errSyntheticNamedExportsNeedNamespaceExport(
						this.module.id,
						this.module.info.syntheticNamedExports
					)
				);
			}
		}
		return (this.baseVariable = baseVariable);
	}

	getBaseVariableName(): string {
		return this.syntheticNamespace.getBaseVariableName();
	}

	getName(): string {
		const name = this.name;
		return `${this.syntheticNamespace.getName()}${getPropertyAccess(name)}`;
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariableInModule(this.syntheticNamespace);
		}
	}

	setRenderNames(baseName: string | null, name: string | null) {
		super.setRenderNames(baseName, name);
	}
}

const getPropertyAccess = (name: string) => {
	return !RESERVED_NAMES[name] && /^(?!\d)[\w$]+$/.test(name)
		? `.${name}`
		: `[${JSON.stringify(name)}]`;
};
