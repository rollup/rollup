import { EMPTY_ARRAY } from '../../../utils/blank';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import {
	INTERACTION_ACCESSED,
	INTERACTION_CALLED,
	NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
	NODE_INTERACTION_UNKNOWN_CALL
} from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import { EMPTY_PATH, UNKNOWN_INTEGER_PATH, UNKNOWN_PATH } from '../../utils/PathTracker';
import {
	UNKNOWN_LITERAL_BOOLEAN,
	UNKNOWN_LITERAL_NUMBER,
	UNKNOWN_LITERAL_STRING
} from '../../values';
import { Flag, isFlagSet, setFlag } from './BitFlags';
import type { LiteralValueOrUnknown } from './Expression';
import {
	ExpressionEntity,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownTruthyValue,
	UnknownValue
} from './Expression';

type MethodDescription = {
	virtual?: boolean;
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
	constructor(protected readonly description: MethodDescription) {
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

	getLiteralValueAtPath(
		path: ObjectPath,
		_recursionTracker: EntityPathTracker,
		_origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length) return UnknownValue;
		return this.description.virtual ? undefined : UnknownTruthyValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		{ args }: NodeInteractionCalled,
		_recursionTracker: EntityPathTracker,
		_origin: DeoptimizableEntity
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
		{ args, type }: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (path.length > (type === INTERACTION_ACCESSED ? 1 : 0)) {
			return true;
		}
		if (type === INTERACTION_CALLED) {
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

export class OptimizedMethod extends Method implements DeoptimizableEntity {
	private expressionsToBeDeoptimized: DeoptimizableEntity[] = [];

	private get hasDeoptimizedCache(): boolean {
		return isFlagSet(this.flags, Flag.hasDeoptimizedCache);
	}
	private set hasDeoptimizedCache(value: boolean) {
		this.flags = setFlag(this.flags, Flag.hasDeoptimizedCache, value);
	}

	deoptimizeCache(): void {
		this.hasDeoptimizedCache = true;
		const { expressionsToBeDeoptimized } = this;
		this.expressionsToBeDeoptimized = EMPTY_ARRAY as unknown as DeoptimizableEntity[];
		if (expressionsToBeDeoptimized.length) {
			for (const expression of expressionsToBeDeoptimized) {
				expression.deoptimizeCache();
			}
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		if (this.hasDeoptimizedCache) return UNKNOWN_RETURN_EXPRESSION;

		const result = super.getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);

		// Don't bother tracking deopt if unnecessary to avoid unnecessdary treeshaking passes.
		if (result[0] === UNKNOWN_EXPRESSION) return result;

		this.expressionsToBeDeoptimized.push(origin);
		return [result[0], true];
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		if (
			!this.hasDeoptimizedCache &&
			path.length <= (interaction.type === INTERACTION_ACCESSED ? 1 : 0)
		)
			return false;
		return super.hasEffectsOnInteractionAtPath(path, interaction, context);
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

export function createDefaultHasInstance(owner: ExpressionEntity) {
	return new OptimizedMethod({
		callsArgs: null,
		mutatesArgs: false,
		mutatesSelfAsArray: false,
		returns: () =>
			owner.included
				? UNKNOWN_LITERAL_BOOLEAN
				: new (class extends ExpressionEntity {
						getLiteralValueAtPath(
							path: ObjectPath,
							_recursionTracker: EntityPathTracker,
							_origin: DeoptimizableEntity
						): LiteralValueOrUnknown {
							return !path.length ? false : UnknownValue;
						}
					})(),
		returnsPrimitive: null,
		virtual: true
	});
}
