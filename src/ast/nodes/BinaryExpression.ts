import type MagicString from 'magic-string';
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
import type * as NodeType from './NodeType';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { doNotDeoptimize, type ExpressionNode, NodeBase } from './shared/Node';

type Operator =
	| '!='
	| '!=='
	| '%'
	| '&'
	| '*'
	| '**'
	| '+'
	| '-'
	| '/'
	| '<'
	| '<<'
	| '<='
	| '=='
	| '==='
	| '>'
	| '>='
	| '>>'
	| '>>>'
	| '^'
	| '|'
	| 'in'
	| 'instanceof';

const binaryOperators: Partial<
	Record<Operator, (left: LiteralValue, right: LiteralValue) => LiteralValueOrUnknown>
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
	'|': (left: any, right: any) => left | right
	// We use the fallback for cases where we return something unknown
	// in: () => UnknownValue,
	// instanceof: () => UnknownValue,
};

export default class BinaryExpression extends NodeBase implements DeoptimizableEntity {
	left!: ExpressionNode;
	operator!: keyof typeof binaryOperators;
	right!: ExpressionNode;
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

		const operatorFunction = binaryOperators[this.operator];
		if (!operatorFunction) return UnknownValue;

		return operatorFunction(leftValue, rightValue);
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
