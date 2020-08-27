import Module, { AstContext } from '../../Module';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	module: Module;
	syntheticNamespace: Variable;

	constructor(context: AstContext, name: string, syntheticNamespace: Variable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.syntheticNamespace = syntheticNamespace;
	}

	getBaseVariable(): Variable {
		let baseVariable = this.syntheticNamespace;
		if (baseVariable instanceof ExportDefaultVariable) {
			baseVariable = baseVariable.getOriginalVariable();
		}
		if (baseVariable instanceof SyntheticNamedExportVariable) {
			baseVariable = baseVariable.getBaseVariable();
		}
		return baseVariable;
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
			this.context.includeVariable(this.syntheticNamespace);
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
