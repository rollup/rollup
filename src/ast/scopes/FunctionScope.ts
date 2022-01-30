import type { AstContext } from '../../Module';
import type { InclusionContext } from '../ExecutionContext';
import type SpreadElement from '../nodes/SpreadElement';
import type { ExpressionNode } from '../nodes/shared/Node';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import type ChildScope from './ChildScope';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	readonly argumentsVariable: ArgumentsVariable;
	readonly thisVariable: ThisVariable;

	constructor(parent: ChildScope, context: AstContext) {
		super(parent, context);
		this.variables.set('arguments', (this.argumentsVariable = new ArgumentsVariable(context)));
		this.variables.set('this', (this.thisVariable = new ThisVariable(context)));
	}

	findLexicalBoundary(): ChildScope {
		return this;
	}

	includeCallArguments(
		context: InclusionContext,
		args: readonly (ExpressionNode | SpreadElement)[]
	): void {
		super.includeCallArguments(context, args);
		if (this.argumentsVariable.included) {
			for (const arg of args) {
				if (!arg.included) {
					arg.include(context, false);
				}
			}
		}
	}
}
