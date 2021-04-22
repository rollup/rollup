import { CallOptions, NO_ARGS } from '../../CallOptions';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { LiteralValueOrUnknown, UnknownValue, UNKNOWN_EXPRESSION } from '../../unknownValues';
import { EMPTY_PATH, ObjectPath } from '../../utils/PathTracker';
import { UNKNOWN_LITERAL_BOOLEAN, UNKNOWN_LITERAL_STRING } from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';
import { ExpressionNode } from './Node';

type MethodDescription = {
	callsArgs: number[] | null;
	mutatesSelf: boolean;
} & (
	| {
			returns: { new (): ExpressionEntity };
			returnsPrimitive: null;
	  }
	| {
			returns: null;
			returnsPrimitive: ExpressionEntity;
	  }
);

class Method implements ExpressionEntity {
	public included = true;

	constructor(private readonly description: MethodDescription) {}

	deoptimizePath(): void {}

	deoptimizeProperties(): void {}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(path: ObjectPath): ExpressionEntity {
		if (path.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return this.description.returnsPrimitive || new this.description.returns();
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath): boolean {
		return path.length > 0;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		if (path.length > 0) {
			return true;
		}
		if (!this.description.callsArgs) {
			return false;
		}
		for (const argIndex of this.description.callsArgs) {
			if (
				callOptions.args[argIndex]?.hasEffectsWhenCalledAtPath(
					EMPTY_PATH,
					{
						args: NO_ARGS,
						withNew: false
					},
					context
				)
			) {
				return true;
			}
		}
		return false;
	}

	include(): void {}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		for (const arg of args) {
			arg.include(context, false);
		}
	}

	mayModifyThisWhenCalledAtPath(path: ObjectPath): boolean {
		return path.length === 0 && this.description.mutatesSelf;
	}
}

export const METHOD_RETURNS_BOOLEAN = new Method({
	callsArgs: null,
	mutatesSelf: false,
	returns: null,
	returnsPrimitive: UNKNOWN_LITERAL_BOOLEAN
})

export const METHOD_RETURNS_STRING = new Method({
	callsArgs: null,
	mutatesSelf: false,
	returns: null,
	returnsPrimitive: UNKNOWN_LITERAL_STRING
})

export const METHOD_RETURNS_UNKNOWN = new Method({
	callsArgs: null,
	mutatesSelf: false,
	returns: null,
	returnsPrimitive: UNKNOWN_EXPRESSION
})
