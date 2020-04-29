import Module, { AstContext } from '../../Module';
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
		return this.defaultVariable instanceof SyntheticNamedExportVariable
			? this.defaultVariable.getBaseVariable()
			: this.defaultVariable;
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
