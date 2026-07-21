import { EMPTY_SET } from '../../../utils/blank';
import UNASSIGNED from '../../../utils/unassigned';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import {
	ExpressionEntity,
	type LiteralValueOrUnknown,
	UnknownFalsyValue,
	UnknownTruthyValue,
	UnknownValue
} from './Expression';

type Value = Exclude<LiteralValueOrUnknown, typeof UnknownValue>;
function mergeValues(a: Value, b: Value): LiteralValueOrUnknown {
	if (a === b) return a;

	if (a === UnknownTruthyValue) {
		if (b && b !== UnknownFalsyValue) return UnknownTruthyValue;
		return UnknownValue;
	}

	if (a === UnknownFalsyValue) {
		if (!b || b === UnknownFalsyValue) return UnknownFalsyValue;
		return UnknownValue;
	}

	if (a && b) return UnknownTruthyValue;
	if (!a && !b) return UnknownFalsyValue;
	return UnknownValue;
}

export class MultiExpression extends ExpressionEntity implements DeoptimizableEntity {
	private literalValue: LiteralValueOrUnknown | typeof UNASSIGNED = UNASSIGNED;
	private dependantEntities = new Set<DeoptimizableEntity>();
	constructor(private expressions: readonly ExpressionEntity[]) {
		super();
	}

	deoptimizeCache(): void {
		this.literalValue = UnknownValue;
		this.dependantEntities.forEach(v => v.deoptimizeCache());
		this.dependantEntities = EMPTY_SET;
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
			if (this.literalValue !== UnknownValue) this.dependantEntities.add(origin);

			if (this.literalValue === UNASSIGNED)
				this.literalValue = this.doGetLiteralValueAtPath(path, recursionTracker, this);

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
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		const returnExpressions = this.expressions.map(expression =>
			expression.getReturnExpressionWhenCalledAtPath(path, interaction, recursionTracker, origin)
		);

		let pure = true;
		return [
			new MultiExpression(
				returnExpressions.map(expression => ((pure &&= expression[1]), expression[0]))
			),
			pure
		];
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsOnInteractionAtPath(path, interaction, context)) return true;
		}
		return false;
	}
}
