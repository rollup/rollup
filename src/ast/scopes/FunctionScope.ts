import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteractionCalled } from '../NodeInteractions';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ThisVariable from '../variables/ThisVariable';
import type ChildScope from './ChildScope';
import ReturnValueScope from './ReturnValueScope';

export default class FunctionScope extends ReturnValueScope {
	readonly argumentsVariable: ArgumentsVariable;
	readonly thisVariable: ThisVariable;

	constructor(parent: ChildScope) {
		super(parent, false);
		const { context } = parent;
		this.variables.set('arguments', (this.argumentsVariable = new ArgumentsVariable(context)));
		this.variables.set('this', (this.thisVariable = new ThisVariable(context)));
	}

	findLexicalBoundary(): ChildScope {
		return this;
	}

	includeCallArguments(context: InclusionContext, interaction: NodeInteractionCalled): void {
		super.includeCallArguments(context, interaction);
		if (this.argumentsVariable.included) {
			const { args } = interaction;
			for (let argumentIndex = 1; argumentIndex < args.length; argumentIndex++) {
				args[argumentIndex]?.includePath(UNKNOWN_PATH, context, false);
			}
		}
	}

	protected addArgumentToBeDeoptimized(argument: ExpressionEntity) {
		this.argumentsVariable.addArgumentToBeDeoptimized(argument);
	}
}
