import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	EMPTY_IMMUTABLE_TRACKER,
	ImmutableEntityPathTracker
} from '../utils/ImmutableEntityPathTracker';
import { EMPTY_PATH, LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../values';
import ExpressionStatement from './ExpressionStatement';
import { LiteralValue } from './Literal';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

const binaryOperators: {
	[operator: string]: (left: LiteralValue, right: LiteralValue) => LiteralValueOrUnknown;
} = {
	'!=': (left, right) => left != right,
	'!==': (left, right) => left !== right,
	'%': (left: any, right: any) => left % right,
	'&': (left: any, right: any) => left & right,
	'*': (left: any, right: any) => left * right,
	// At the moment, "**" will be transpiled to Math.pow
	'**': (left: any, right: any) => left ** right,
	'+': (left: any, right: any) => left + right,
	'-': (left: any, right: any) => left - right,
	'/': (left: any, right: any) => left / right,
	'<': (left, right) => (left as NonNullable<LiteralValue>) < (right as NonNullable<LiteralValue>),
	'<<': (left: any, right: any) => left << right,
	'<=': (left, right) =>
		(left as NonNullable<LiteralValue>) <= (right as NonNullable<LiteralValue>),
	'==': (left, right) => left == right,
	'===': (left, right) => left === right,
	'>': (left, right) => (left as NonNullable<LiteralValue>) > (right as NonNullable<LiteralValue>),
	'>=': (left, right) =>
		(left as NonNullable<LiteralValue>) >= (right as NonNullable<LiteralValue>),
	'>>': (left: any, right: any) => left >> right,
	'>>>': (left: any, right: any) => left >>> right,
	'^': (left: any, right: any) => left ^ right,
	in: () => UNKNOWN_VALUE,
	instanceof: () => UNKNOWN_VALUE,
	'|': (left: any, right: any) => left | right
};

export default class BinaryExpression extends NodeBase implements DeoptimizableEntity {
	left!: ExpressionNode;
	operator!: keyof typeof binaryOperators;
	right!: ExpressionNode;
	type!: NodeType.tBinaryExpression;

	deoptimizeCache(): void {}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UNKNOWN_VALUE;
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (leftValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (rightValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		const operatorFn = binaryOperators[this.operator];
		if (!operatorFn) return UNKNOWN_VALUE;

		return operatorFn(leftValue as LiteralValue, rightValue as LiteralValue);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		// support some implicit type coercion runtime errors
		if (
			this.operator === '+' &&
			this.parent instanceof ExpressionStatement &&
			this.left.getLiteralValueAtPath(EMPTY_PATH, EMPTY_IMMUTABLE_TRACKER, this) === ''
		) {
			return true;
		}
		return super.hasEffects(options);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
