import { AstContext } from '../../Module';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { UNKNOWN_EXPRESSION, UnknownObjectExpression } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import ChildScope from './ChildScope';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	argumentsVariable: ArgumentsVariable;
	thisVariable: ThisVariable;

	constructor(parent: ChildScope, context: AstContext) {
		super(parent, context);
		this.variables.set(
			'arguments',
			(this.argumentsVariable = new ArgumentsVariable(super.getParameterVariables(), context))
		);
		this.variables.set('this', (this.thisVariable = new ThisVariable(context)));
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
				this.thisVariable,
				withNew ? new UnknownObjectExpression() : UNKNOWN_EXPRESSION
			)
			.setArgumentsVariables(
				args.map((parameter, index) => super.getParameterVariables()[index] || parameter)
			);
	}
}
