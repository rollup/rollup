import ReturnValueScope from './ReturnValueScope';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import LocalVariable from '../variables/LocalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import ExternalVariable from '../variables/ExternalVariable';
import { UNKNOWN_EXPRESSION, UNKNOWN_OBJECT_EXPRESSION } from '../values';

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
