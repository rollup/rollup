import Module, { AstContext } from '../../Module';
import { InclusionContext } from '../ExecutionContext';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariableVariable extends Variable {
	context: AstContext;
	defaultVariable: ExportDefaultVariable;
	module: Module;

	constructor(context: AstContext, name: string, defaultVariable: ExportDefaultVariable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.defaultVariable = defaultVariable;
		this.setRenderNames(defaultVariable.getName(), name);
	}

	include(context: InclusionContext) {
		if (!this.included) {
			this.included = true;
			this.context.includeVariable(context, this.defaultVariable);
		}
	}
}
