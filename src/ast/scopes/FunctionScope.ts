import { AstContext } from '../../Module';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { ExpressionNode } from '../nodes/shared/Node';
import SpreadElement from '../nodes/SpreadElement';
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
		this.variables.set('arguments', (this.argumentsVariable = new ArgumentsVariable(context)));
		this.variables.set('this', (this.thisVariable = new ThisVariable(context)));
	}

	findLexicalBoundary() {
		return this;
	}

	getOptionsWhenCalledWith(
		{ withNew }: CallOptions,
		options: ExecutionPathOptions
	): ExecutionPathOptions {
		return options.replaceVariableInit(
			this.thisVariable,
			withNew ? new UnknownObjectExpression() : UNKNOWN_EXPRESSION
		);
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		super.includeCallArguments(args);
		if (this.argumentsVariable.included) {
			for (const arg of args) {
				if (!arg.included) {
					arg.include(false);
				}
			}
		}
	}
}
