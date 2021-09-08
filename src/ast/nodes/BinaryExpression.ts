import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import {
	EMPTY_PATH,
	ObjectPath,
	PathTracker,
	SHARED_RECURSION_TRACKER
} from '../utils/PathTracker';
import ExpressionStatement from './ExpressionStatement';
import { LiteralValue } from './Literal';
import * as NodeType from './NodeType';
import { LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
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
	in: () => UnknownValue,
	instanceof: () => UnknownValue,
	'|': (left: any, right: any) => left | right
};

export default class BinaryExpression extends NodeBase implements DeoptimizableEntity {
	declare left: ExpressionNode;
	declare operator: keyof typeof binaryOperators;
	declare right: ExpressionNode;
	declare type: NodeType.tBinaryExpression;

	deoptimizeCache(): void {}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UnknownValue;
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (leftValue === UnknownValue) return UnknownValue;

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (rightValue === UnknownValue) return UnknownValue;

		const operatorFn = binaryOperators[this.operator];
		if (!operatorFn) return UnknownValue;

		return operatorFn(leftValue, rightValue);
	}

	hasEffects(context: HasEffectsContext): boolean {
		// support some implicit type coercion runtime errors
		if (
			this.operator === '+' &&
			this.parent instanceof ExpressionStatement &&
			this.left.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this) === ''
		)
			return true;
		return super.hasEffects(context);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return path.length > 1;
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		this.left.render(code, options, { renderedSurroundingElement });
		this.right.render(code, options);
	}
}
