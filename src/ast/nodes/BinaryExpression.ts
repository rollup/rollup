import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import ExpressionStatement from './ExpressionStatement';
import type { LiteralValue } from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { doNotDeoptimize, NodeBase } from './shared/Node';

const binaryOperators: Record<
	ast.BinaryExpression['operator'],
	(left: LiteralValue, right: LiteralValue) => LiteralValueOrUnknown
> = {
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
	'<': (left, right) => left! < right!,
	'<<': (left: any, right: any) => left << right,
	'<=': (left, right) => left! <= right!,
	'==': (left, right) => left == right,
	'===': (left, right) => left === right,
	'>': (left, right) => left! > right!,
	'>=': (left, right) => left! >= right!,
	'>>': (left: any, right: any) => left >> right,
	'>>>': (left: any, right: any) => left >>> right,
	'^': (left: any, right: any) => left ^ right,
	in: () => UnknownValue,
	instanceof: () => UnknownValue,
	'|': (left: any, right: any) => left | right
};

export default class BinaryExpression
	extends NodeBase<ast.BinaryExpression>
	implements DeoptimizableEntity
{
	parent!: nodes.BinaryExpressionParent;
	left!: nodes.Expression;
	operator!: ast.BinaryExpression['operator'];
	right!: nodes.Expression;
	type!: NodeType.tBinaryExpression;

	deoptimizeCache(): void {}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UnknownValue;
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof leftValue === 'symbol') return UnknownValue;

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof rightValue === 'symbol') return UnknownValue;

		return binaryOperators[this.operator](leftValue, rightValue);
	}

	hasEffects(context: HasEffectsContext): boolean {
		// support some implicit type coercion runtime errors
		if (
			this.operator === '+' &&
			this.parent instanceof ExpressionStatement &&
			this.left.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this) === ''
		) {
			return true;
		}
		return super.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 1;
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (this.operator === 'in') {
			this.right.includePath(UNKNOWN_PATH, context);
		}
	}

	removeAnnotations(code: MagicString) {
		this.left.removeAnnotations(code);
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

BinaryExpression.prototype.applyDeoptimizations = doNotDeoptimize;
