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

	includeCallArguments(interaction: NodeInteractionCalled, context: InclusionContext): void {
		super.includeCallArguments(interaction, context);
		const { args } = interaction;
		const [thisArgument] = args;
		if (thisArgument) {
			this.thisVariable.addArgumentForInclusion(thisArgument, context);
			thisArgument.include(context, false);
		}
		if (this.argumentsVariable.included) {
			for (let argumentIndex = 1; argumentIndex < args.length; argumentIndex++) {
				const argument = args[argumentIndex];
				if (argument) {
					argument.includePath(UNKNOWN_PATH, context);
					argument.include(context, false);
				}
			}
		}
	}

	protected addArgumentToBeDeoptimized(argument: ExpressionEntity) {
		this.argumentsVariable.addArgumentToBeDeoptimized(argument);
	}
}
