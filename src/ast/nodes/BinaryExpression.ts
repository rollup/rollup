import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import { INTERACTION_ACCESSED, INTERACTION_CALLED } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	INSTANCEOF_PATH,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH
} from '../utils/PathTracker';
import { getRenderedLiteralValue } from '../utils/renderLiteralValue';
import { tryCastLiteralValueToBoolean } from '../utils/tryCastLiteralValueToBoolean';
import ExternalVariable from '../variables/ExternalVariable';
import NamespaceVariable from '../variables/NamespaceVariable';
import SyntheticNamedExportVariable from '../variables/SyntheticNamedExportVariable';
import ExpressionStatement from './ExpressionStatement';
import type { LiteralValue } from './Literal';
import type * as NodeType from './NodeType';
import {
	type InclusionOptions,
	type LiteralValueOrUnknown,
	UnknownValue
} from './shared/Expression';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase
} from './shared/Node';

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

const UNASSIGNED = Symbol('Unassigned');

export default class BinaryExpression extends NodeBase implements DeoptimizableEntity {
	declare left: ExpressionNode;
	declare operator: keyof typeof binaryOperators;
	declare right: ExpressionNode;
	declare type: NodeType.tBinaryExpression;

	declare private interaction: NodeInteractionCalled;

	private renderedLiteralValue: string | typeof UnknownValue | typeof UNASSIGNED = UNASSIGNED;

	initialise(): void {
		super.initialise();
		if (this.operator === 'instanceof') {
			this.interaction = {
				args: [null, this.left],
				type: INTERACTION_CALLED,
				withNew: false
			};
		}
	}

	deoptimizeCache(): void {
		this.renderedLiteralValue = UnknownValue;
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UnknownValue;

		if (this.operator === 'instanceof') {
			const [returnValue] = this.right.getReturnExpressionWhenCalledAtPath(
				INSTANCEOF_PATH,
				this.interaction,
				recursionTracker,
				origin
			);

			const result = returnValue.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
			return tryCastLiteralValueToBoolean(result);
		}

		const leftValue = this.left.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof leftValue === 'symbol') return UnknownValue;

		// Optimize `'export' in namespace`
		if (this.operator === 'in' && this.right.variable instanceof NamespaceVariable) {
			const [variable] = this.right.variable.context.traceExport(String(leftValue));
			if (variable instanceof ExternalVariable) return UnknownValue;
			if (variable instanceof SyntheticNamedExportVariable) return UnknownValue;
			return !!variable;
		}

		const rightValue = this.right.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof rightValue === 'symbol') return UnknownValue;

		const operatorFunction = binaryOperators[this.operator];
		if (!operatorFunction) return UnknownValue;

		return operatorFunction(leftValue, rightValue);
	}

	getRenderedLiteralValue() {
		// Only optimize `'export' in ns`
		if (this.operator !== 'in' || !(this.right.variable instanceof NamespaceVariable)) {
			return UnknownValue;
		}

		if (this.renderedLiteralValue !== UNASSIGNED) return this.renderedLiteralValue;
		return (this.renderedLiteralValue = getRenderedLiteralValue(
			this.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this)
		));
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

		if (this.left.hasEffects(context) || this.right.hasEffects(context)) {
			return true;
		}

		if (
			this.operator === 'instanceof' &&
			this.right.hasEffectsOnInteractionAtPath(INSTANCEOF_PATH, this.interaction, context)
		) {
			return true;
		}

		return false;
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > 1;
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	) {
		if (!this.included) this.includeNode(context);
		if (typeof this.getRenderedLiteralValue() === 'symbol') {
			this.left.include(context, includeChildrenRecursively, options);
			this.right.include(context, includeChildrenRecursively, options);

			// `instanceof` will attempt to call RHS's `Symbol.hasInstance` if it exists.
			if (this.operator === 'instanceof') this.right.includePath(INSTANCEOF_PATH, context);
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		if (this.operator === 'in' && typeof this.getRenderedLiteralValue() === 'symbol') {
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
		const renderedLiteralValue = this.getRenderedLiteralValue();
		if (typeof renderedLiteralValue !== 'symbol') {
			code.overwrite(this.start, this.end, renderedLiteralValue);
		} else {
			this.left.render(code, options, { renderedSurroundingElement });
			this.right.render(code, options);
		}
	}
}

BinaryExpression.prototype.applyDeoptimizations = doNotDeoptimize;
