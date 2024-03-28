import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
	NODE_INTERACTION_UNKNOWN_CALL
} from '../../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	UNKNOWN_INTEGER_PATH,
	UNKNOWN_PATH
} from '../../utils/PathTracker';
import {
	UNKNOWN_LITERAL_BOOLEAN,
	UNKNOWN_LITERAL_NUMBER,
	UNKNOWN_LITERAL_STRING
} from '../../values';
import { ExpressionEntity, UNKNOWN_EXPRESSION, UNKNOWN_RETURN_EXPRESSION } from './Expression';

type MethodDescription = {
	callsArgs: number[] | null;
	mutatesSelfAsArray: boolean | 'deopt-only';
	mutatesArgs: boolean;
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

	deoptimizeArgumentsOnInteractionAtPath({ args, type }: NodeInteraction, path: ObjectPath): void {
		if (type === INTERACTION_CALLED && path.length === 0) {
			if (this.description.mutatesSelfAsArray) {
				args[0]?.deoptimizePath(UNKNOWN_INTEGER_PATH);
			}
			if (this.description.mutatesArgs) {
				for (let index = 1; index < args.length; index++) {
					args[index]!.deoptimizePath(UNKNOWN_PATH);
				}
			}
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		{ args }: NodeInteractionCalled
	): [expression: ExpressionEntity, isPure: boolean] {
		if (path.length > 0) {
			return UNKNOWN_RETURN_EXPRESSION;
		}
		return [
			this.description.returnsPrimitive ||
				(this.description.returns === 'self'
					? args[0] || UNKNOWN_EXPRESSION
					: this.description.returns()),
			false
		];
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const { type } = interaction;
		if (path.length > (type === INTERACTION_ACCESSED ? 1 : 0)) {
			return true;
		}
		if (type === INTERACTION_CALLED) {
			const { args } = interaction;
			if (
				this.description.mutatesSelfAsArray === true &&
				args[0]?.hasEffectsOnInteractionAtPath(
					UNKNOWN_INTEGER_PATH,
					NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
					context
				)
			) {
				return true;
			}
			if (this.description.callsArgs) {
				for (const argumentIndex of this.description.callsArgs) {
					if (
						args[argumentIndex + 1]?.hasEffectsOnInteractionAtPath(
							EMPTY_PATH,
							NODE_INTERACTION_UNKNOWN_CALL,
							context
						)
					) {
						return true;
					}
				}
			}
		}
		return false;
	}
}

export const METHOD_RETURNS_BOOLEAN = [
	new Method({
		callsArgs: null,
		mutatesArgs: false,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_BOOLEAN
	})
];

export const METHOD_RETURNS_STRING = [
	new Method({
		callsArgs: null,
		mutatesArgs: false,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_STRING
	})
];

export const METHOD_RETURNS_NUMBER = [
	new Method({
		callsArgs: null,
		mutatesArgs: false,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_LITERAL_NUMBER
	})
];

export const METHOD_RETURNS_UNKNOWN = [
	new Method({
		callsArgs: null,
		mutatesArgs: false,
		mutatesSelfAsArray: false,
		returns: null,
		returnsPrimitive: UNKNOWN_EXPRESSION
	})
];
