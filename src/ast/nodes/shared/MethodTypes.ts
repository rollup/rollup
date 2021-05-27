import { CallOptions, NO_ARGS } from '../../CallOptions';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { EVENT_CALLED, NodeEvent } from '../../NodeEvents';
import { EMPTY_PATH, ObjectPath, UNKNOWN_INTEGER_PATH } from '../../utils/PathTracker';
import {
	UNKNOWN_LITERAL_BOOLEAN,
	UNKNOWN_LITERAL_NUMBER,
	UNKNOWN_LITERAL_STRING
} from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './Expression';
import { ExpressionNode } from './Node';

type MethodDescription = {
	callsArgs: number[] | null;
	mutatesSelfAsArray: boolean | 'deopt-only';
} & (
	| {
			returns: 'self' | (() => ExpressionEntity);
			returnsPrimitive: null;
	  }
	| {
			returns: null;
			returnsPrimitive: ExpressionEntity;
	  }
);

export class Method extends ExpressionEntity {
	constructor(private readonly description: MethodDescription) {
		super();
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity
	): void {
		if (event === EVENT_CALLED && path.length === 0 && this.description.mutatesSelfAsArray) {
			thisParameter.deoptimizePath(UNKNOWN_INTEGER_PATH);
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions
	): ExpressionEntity {
		if (path.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return (
			this.description.returnsPrimitive ||
			(this.description.returns === 'self'
				? callOptions.thisParam || UNKNOWN_EXPRESSION
				: this.description.returns())
		);
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
		if (
			path.length > 0 ||
			(this.description.mutatesSelfAsArray === true &&
				callOptions.thisParam?.hasEffectsWhenAssignedAtPath(UNKNOWN_INTEGER_PATH, context))
		) {
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
						thisParam: null,
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

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]): void {
		for (const arg of args) {
			arg.include(context, false);
		}
	}
}

export const METHOD_RETURNS_BOOLEAN = [
	new Method({
		callsArgs: null,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_BOOLEAN
	})
];

export const METHOD_RETURNS_STRING = [
	new Method({
		callsArgs: null,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_STRING
	})
];

export const METHOD_RETURNS_NUMBER = [
	new Method({
		callsArgs: null,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_NUMBER
	})
];

export const METHOD_RETURNS_UNKNOWN = [
	new Method({
		callsArgs: null,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_EXPRESSION
	})
];
