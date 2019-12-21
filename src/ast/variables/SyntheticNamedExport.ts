import Module, { AstContext } from '../../Module';
import { RenderOptions } from '../../utils/renderHelpers';
import { InclusionContext } from '../ExecutionContext';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExport extends Variable {
	context: AstContext;
	defaultVariable: ExportDefaultVariable;
	module: Module;

	constructor(context: AstContext, name: string, defaultVariable: ExportDefaultVariable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.defaultVariable = defaultVariable;
	}

	include(context: InclusionContext) {
		if (!this.included) {
			this.included = true;
			this.context.includeVariable(context, this.defaultVariable);
		}
	}

	renderBlock(options: RenderOptions) {
		const _ = options.compact ? '' : ' ';
		const name = this.getName();
		const defaultVariable = this.defaultVariable.getName();
		const output = `${options.varOrConst} ${name}${_}=${_}${defaultVariable}.${this.name};`;
		return output;
	}
}
