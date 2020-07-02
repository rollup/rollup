import Module, { AstContext } from '../../Module';
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

	getName(): string {
		const name = this.name;
		const renderBaseName = this.syntheticNamespace.getName();
		return `${renderBaseName}${getPropertyAccess(name)}`;
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariable(this.syntheticNamespace);
		}
	}
}

const getPropertyAccess = (name: string) => {
	return /^(?!\d)[\w$]+$/.test(name) ? `.${name}` : `[${JSON.stringify(name)}]`;
};
