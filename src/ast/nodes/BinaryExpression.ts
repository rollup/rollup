import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import {
	INTERACTION_ACCESSED,
	NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
	NodeInteraction
} from '../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	type PathTracker,
	SHARED_RECURSION_TRACKER,
	TEST_INCLUSION_PATH
} from '../utils/PathTracker';
import ExpressionStatement from './ExpressionStatement';
import type { LiteralValue } from './Literal';
import type * as NodeType from './NodeType';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import { type ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

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

const binaryOperators: {
	[operator in Operator]?: (left: LiteralValue, right: LiteralValue) => LiteralValueOrUnknown;
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
	'|': (left: any, right: any) => left | right
	// We use the fallback for cases where we return something unknown
	// in: () => UnknownValue,
	// instanceof: () => UnknownValue,
};

export default class BinaryExpression extends NodeBase implements DeoptimizableEntity {
	declare left: ExpressionNode;
	declare operator: keyof typeof binaryOperators;
	declare right: ExpressionNode;
	declare type: NodeType.tBinaryExpression;
	private expressionsDependingOnNegativeInstanceof = new Set<DeoptimizableEntity>();

	deoptimizeCache(): void {}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UnknownValue;
		if (this.operator === 'instanceof') {
			if (
				this.right.hasEffectsOnInteractionAtPath(
					TEST_INCLUSION_PATH,
					NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
					createHasEffectsContext()
				)
			) {
				return UnknownValue;
			}
			this.expressionsDependingOnNegativeInstanceof.add(origin);
			return false;
		}
		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof leftValue === 'symbol') return UnknownValue;

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof rightValue === 'symbol') return UnknownValue;

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
		) {
			return true;
		}
		this.deoptimizeInstanceof(context);
		return super.hasEffects(context);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 1;
	}

	// TODO Lukas if the operator is instanceof, only include if necessary
	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.deoptimizeInstanceof();
		if (!this.expressionsDependingOnNegativeInstanceof.size) {
			super.include(context, includeChildrenRecursively);
		}
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		this.left.render(code, options, { renderedSurroundingElement });
		this.right.render(code, options);
	}

	private deoptimizeInstanceof(context?: HasEffectsContext) {
		if (
			this.operator === 'instanceof' &&
			this.expressionsDependingOnNegativeInstanceof.size &&
			this.right.hasEffectsOnInteractionAtPath(
				TEST_INCLUSION_PATH,
				NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
				context || createHasEffectsContext()
			)
		) {
			for (const expression of this.expressionsDependingOnNegativeInstanceof) {
				expression.deoptimizeCache();
			}
			this.expressionsDependingOnNegativeInstanceof.clear();
		}
	}
}
