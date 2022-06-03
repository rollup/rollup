import { type CallOptions } from '../../CallOptions';
import type { HasEffectsContext } from '../../ExecutionContext';
import {
	INTERACTION_CALLED,
	NO_ARGS,
	NodeInteraction,
	NodeInteractionWithThisArg
} from '../../NodeInteractions';
import { EMPTY_PATH, type ObjectPath, UNKNOWN_INTEGER_PATH } from '../../utils/PathTracker';
import {
	UNKNOWN_LITERAL_BOOLEAN,
	UNKNOWN_LITERAL_NUMBER,
	UNKNOWN_LITERAL_STRING
} from '../../values';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './Expression';

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

	deoptimizeThisOnInteractionAtPath(
		{ type, thisArg }: NodeInteractionWithThisArg,
		path: ObjectPath
	): void {
		if (type === INTERACTION_CALLED && path.length === 0 && this.description.mutatesSelfAsArray) {
			thisArg.deoptimizePath(UNKNOWN_INTEGER_PATH);
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteraction
	): ExpressionEntity {
		if (path.length > 0) {
			return UNKNOWN_EXPRESSION;
		}
		return (
			this.description.returnsPrimitive ||
			(this.description.returns === 'self'
				? interaction.thisArg || UNKNOWN_EXPRESSION
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
				callOptions.thisArg?.hasEffectsWhenAssignedAtPath(UNKNOWN_INTEGER_PATH, context))
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
						thisArg: null,
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
