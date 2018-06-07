import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { UNKNOWN_EXPRESSION, UNKNOWN_OBJECT_EXPRESSION } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ExternalVariable from '../variables/ExternalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	variables: {
		this: ThisVariable;
		default: ExportDefaultVariable;
		arguments: ArgumentsVariable;
		[name: string]: LocalVariable | GlobalVariable | ExternalVariable | ArgumentsVariable;
	};

	constructor(options = {}) {
		super(options);
		this.variables.arguments = new ArgumentsVariable(super.getParameterVariables());
		this.variables.this = new ThisVariable();
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
				withNew ? UNKNOWN_OBJECT_EXPRESSION : UNKNOWN_EXPRESSION
			)
			.setArgumentsVariables(
				args.map((parameter, index) => super.getParameterVariables()[index] || parameter)
			);
	}
}
