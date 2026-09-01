import UNASSIGNED from '../../../utils/unassigned';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import {
	memoizeReturnComposition,
	type ReturnCompositionState
} from '../../utils/returnComposition';
import ReturnStatement from '../ReturnStatement';
import {
	ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownFalsyValue,
	UnknownTruthyValue,
	UnknownValue
} from './Expression';

type Value = Exclude<LiteralValueOrUnknown, typeof UnknownValue>;

// Do not use tryCastLiteralValueToBoolean here as it resolves well-known
// symbols to UnknownValue, which would lose folding precision.
const isKnownTruthy = (value: Value): boolean =>
	value === UnknownTruthyValue || (value !== UnknownFalsyValue && !!value);

// Merges two known (i.e. non-UnknownValue) values into the most precise value
// that covers both, UnknownValue if they differ in truthiness.
function mergeValues(a: Value, b: Value): LiteralValueOrUnknown {
	if (a === b) return a;
	const truthy = isKnownTruthy(a);
	if (truthy !== isKnownTruthy(b)) return UnknownValue;
	return truthy ? UnknownTruthyValue : UnknownFalsyValue;
}

export class MultiExpression extends ExpressionEntity implements DeoptimizableEntity {
	private literalValue: LiteralValueOrUnknown | typeof UNASSIGNED = UNASSIGNED;
	private dependantEntities: Set<DeoptimizableEntity> | null = null;
	private constructor(private expressions: readonly ExpressionEntity[]) {
		super();
	}

	/**
	 * Flattens nested multi-expressions and removes duplicates so that
	 * repeated composition cannot grow the expression structure unboundedly;
	 * a single remaining expression is returned directly.
	 */
	static of(expressions: readonly ExpressionEntity[]): ExpressionEntity {
		const flattened: ExpressionEntity[] = [];
		for (const expression of expressions) {
			MultiExpression.addFlattened(flattened, expression);
		}
		if (flattened.length === 0) return UNKNOWN_EXPRESSION;
		if (flattened.length === 1) return flattened[0];
		return new MultiExpression(flattened);
	}

	private static addFlattened(target: ExpressionEntity[], expression: ExpressionEntity): void {
		if (expression instanceof MultiExpression) {
			for (const nestedExpression of expression.expressions) {
				MultiExpression.addFlattened(target, nestedExpression);
			}
		} else if (!target.includes(expression)) {
			target.push(expression);
		}
	}

	deoptimizeCache(): void {
		if (this.literalValue !== UNASSIGNED) {
			const { dependantEntities } = this;
			this.literalValue = UNASSIGNED;
			this.dependantEntities = null;
			if (dependantEntities) {
				for (const entity of dependantEntities) {
					entity.deoptimizeCache();
				}
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		for (const expression of this.expressions) {
			expression.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length === 0) {
			if (this.literalValue === UNASSIGNED)
				this.literalValue = this.doGetLiteralValueAtPath(path, recursionTracker, this);

			(this.dependantEntities ??= new Set()).add(origin);
			return this.literalValue;
		}

		return this.doGetLiteralValueAtPath(path, recursionTracker, origin);
	}

	private doGetLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		let value: LiteralValueOrUnknown = UnknownValue;
		for (const expression of this.expressions) {
			if (this.isTreeshaken(expression)) continue;

			const expressionValue = expression.getLiteralValueAtPath(path, recursionTracker, origin);
			if (expressionValue === UnknownValue) return UnknownValue;

			if (value === UnknownValue) {
				value = expressionValue;
				continue;
			}

			value = mergeValues(value, expressionValue);
			if (value === UnknownValue) return UnknownValue;
		}

		return value;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity,
		compositionState: ReturnCompositionState | null
	): [expression: ExpressionEntity, isPure: boolean] {
		return memoizeReturnComposition(compositionState, this, path, interaction, origin, state => {
			let pure = true;
			const returnExpressions: ExpressionEntity[] = [];
			for (const expression of this.expressions) {
				const [returnExpression, isPure] = expression.getReturnExpressionWhenCalledAtPath(
					path,
					interaction,
					recursionTracker,
					origin,
					state
				);
				pure &&= isPure;
				returnExpressions.push(returnExpression);
			}
			return [MultiExpression.of(returnExpressions), pure];
		});
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		// We cannot skip treeshaken return statements here: Interactions with the
		// returned object can have effects via any of the possible returned values,
		// even if the corresponding return statement is not (yet) included.
		for (const expression of this.expressions) {
			if (expression.hasEffectsOnInteractionAtPath(path, interaction, context)) return true;
		}
		return false;
	}

	private isTreeshaken(expression: ExpressionEntity): boolean {
		if ('parent' in expression && expression.parent instanceof ReturnStatement) {
			return !expression.parent.checkReached(this);
		}

		return false;
	}
}
