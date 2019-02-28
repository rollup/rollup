import { AstContext } from '../../Module';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { UNKNOWN_EXPRESSION, UnknownObjectExpression } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ExternalVariable from '../variables/ExternalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import ChildScope from './ChildScope';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	variables: {
		[name: string]: LocalVariable | GlobalVariable | ExternalVariable | ArgumentsVariable;
		arguments: ArgumentsVariable;
		default: ExportDefaultVariable;
		this: ThisVariable;
	};

	constructor(parent: ChildScope, context: AstContext) {
		super(parent, context);
		this.variables.arguments = new ArgumentsVariable(super.getParameterVariables(), context);
		this.variables.this = new ThisVariable(context);
	}

	findLexicalBoundary() {
		return this;
	}

	getOptionsWhenCalledWith(
		{ args, withNew }: CallOptions,
		options: ExecutionPathOptions
	): ExecutionPathOptions {
		return options
			.replaceVariableInit(
				this.variables.this,
				withNew ? new UnknownObjectExpression() : UNKNOWN_EXPRESSION
			)
			.setArgumentsVariables(
				args.map((parameter, index) => super.getParameterVariables()[index] || parameter)
			);
	}
}
