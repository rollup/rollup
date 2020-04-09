import Module, { AstContext } from '../../Module';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	defaultVariable: ExportDefaultVariable;
	module: Module;

	constructor(context: AstContext, name: string, defaultVariable: ExportDefaultVariable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.defaultVariable = defaultVariable;
	}

	getName(): string {
		const name = this.name;
		const renderBaseName = this.defaultVariable.getName();
		return `${renderBaseName}${getPropertyAccess(name)}`;
	}

	getOriginalVariable(): Variable {
		return this.defaultVariable.getOriginalVariable();
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
