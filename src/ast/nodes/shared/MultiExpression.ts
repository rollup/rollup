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

export class MultiExpression extends ExpressionEntity {
	constructor(private expressions: readonly ExpressionEntity[]) {
		super();
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
		let value: LiteralValueOrUnknown = UnknownValue;
		for (const expr of this.expressions) {
			if (!expr.isLocallyReachable()) continue;

			const exprValue = expr.getLiteralValueAtPath(path, recursionTracker, origin);
			if (exprValue === UnknownValue) return UnknownValue;

			if (value === UnknownValue) {
				value = exprValue;
				continue;
			}

			value = mergeValues(value, exprValue);
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
			new MultiExpression(returnExpressions.map(expr => ((pure &&= expr[1]), expr[0]))),
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
