import type { HasEffectsContext } from '../../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NO_ARGS,
	NodeInteraction,
	NodeInteractionCalled,
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
		interaction: NodeInteractionCalled
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
			if (
				this.description.mutatesSelfAsArray === true &&
				interaction.thisArg?.hasEffectsOnInteractionAtPath(
					UNKNOWN_INTEGER_PATH,
					{ type: INTERACTION_ASSIGNED, value: UNKNOWN_EXPRESSION },
					context
				)
			) {
				return true;
			}
			if (this.description.callsArgs) {
				for (const argIndex of this.description.callsArgs) {
					if (
						interaction.args[argIndex]?.hasEffectsOnInteractionAtPath(
							EMPTY_PATH,
							{
								args: NO_ARGS,
								thisArg: null,
								type: INTERACTION_CALLED,
								withNew: false
							},
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
