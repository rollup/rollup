import Module, { AstContext } from '../../Module';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	defaultVariable: Variable;
	module: Module;

	constructor(context: AstContext, name: string, defaultVariable: Variable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.defaultVariable = defaultVariable;
	}

	getBaseVariable(): Variable {
		let baseVariable = this.defaultVariable;
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
		const renderBaseName = this.defaultVariable.getName();
		return `${renderBaseName}${getPropertyAccess(name)}`;
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariable(this.defaultVariable);
		}
	}
}

const getPropertyAccess = (name: string) => {
	return /^(?!\d)[\w$]+$/.test(name) ? `.${name}` : `[${JSON.stringify(name)}]`;
};
