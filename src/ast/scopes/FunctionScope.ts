import type { InclusionContext } from '../ExecutionContext';
import type SpreadElement from '../nodes/SpreadElement';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { EMPTY_PATH } from '../utils/PathTracker';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import type ChildScope from './ChildScope';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	readonly argumentsVariable: ArgumentsVariable;
	readonly thisVariable: ThisVariable;

	constructor(parent: ChildScope) {
		const { context } = parent;
		super(parent, false);
		this.variables.set('arguments', (this.argumentsVariable = new ArgumentsVariable(context)));
		this.variables.set('this', (this.thisVariable = new ThisVariable(context)));
	}

	findLexicalBoundary(): ChildScope {
		return this;
	}

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		super.includeCallArguments(context, parameters);
		if (this.argumentsVariable.included) {
			for (const argument of parameters) {
				if (!argument.included) {
					argument.includePath(EMPTY_PATH, context, false);
				}
			}
		}
	}
}
