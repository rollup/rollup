import ReturnValueScope from './ReturnValueScope';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';
import VirtualObjectExpression from '../nodes/shared/VirtualObjectExpression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import LocalVariable from '../variables/LocalVariable';
import GlobalVariable from '../variables/GlobalVariable';
import ExternalVariable from '../variables/ExternalVariable';

export default class FunctionScope extends ReturnValueScope {
	variables: {
		this: ThisVariable;
		default: ExportDefaultVariable;
		[name: string]: LocalVariable | GlobalVariable | ExternalVariable
	};

	constructor (options = {}) {
		super(options);
		this.variables.arguments = new ArgumentsVariable(
			super.getParameterVariables()
		);
		this.variables.this = new ThisVariable();
	}

	findLexicalBoundary () {
		return this;
	}

	getOptionsWhenCalledWith ({ args, withNew }: CallOptions, options: ExecutionPathOptions): ExecutionPathOptions {
		return options
			.replaceVariableInit(
			this.variables.this,
			withNew ? new VirtualObjectExpression() : UNKNOWN_ASSIGNMENT
			)
			.setArgumentsVariables(
			args.map(
				(parameter, index) =>
					super.getParameterVariables()[index] || parameter
			)
			);
	}
}
