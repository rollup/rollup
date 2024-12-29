import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED, NODE_INTERACTION_UNKNOWN_ASSIGNMENT } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type ObjectPath,
	type PathTracker,
	SHARED_RECURSION_TRACKER
} from '../utils/PathTracker';
import Identifier from './Identifier';
import type { LiteralValue } from './Literal';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import type { InclusionOptions } from './shared/Expression';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import type { IncludeChildren } from './shared/Node';
import { type ExpressionNode, NodeBase } from './shared/Node';

const unaryOperators: Record<string, (value: LiteralValue) => LiteralValueOrUnknown> = {
	'!': value => !value,
	'+': value => +(value as NonNullable<LiteralValue>),
	'-': value => -(value as NonNullable<LiteralValue>),
	delete: () => UnknownValue,
	typeof: value => typeof value,
	void: () => undefined,
	'~': value => ~(value as NonNullable<LiteralValue>)
};

export default class UnaryExpression extends NodeBase {
	declare argument: ExpressionNode;
	declare operator: '!' | '+' | '-' | 'delete' | 'typeof' | 'void' | '~';
	declare type: NodeType.tUnaryExpression;
	declare literalValue: LiteralValueOrUnknown;

	get prefix(): boolean {
		return isFlagSet(this.flags, Flag.prefix);
	}
	set prefix(value: boolean) {
		this.flags = setFlag(this.flags, Flag.prefix, value);
	}

	deoptimizeCache(): void {
		this.literalValue = UnknownValue;
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UnknownValue;
		const argumentValue = this.argument.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (typeof argumentValue === 'symbol') return UnknownValue;

		return unaryOperators[this.operator](argumentValue);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (this.operator === 'typeof' && this.argument instanceof Identifier) return false;
		return (
			this.argument.hasEffects(context) ||
			(this.operator === 'delete' &&
				this.argument.hasEffectsOnInteractionAtPath(
					EMPTY_PATH,
					NODE_INTERACTION_UNKNOWN_ASSIGNMENT,
					context
				))
		);
	}

	hasEffectsOnInteractionAtPath(path: ObjectPath, { type }: NodeInteraction): boolean {
		return type !== INTERACTION_ACCESSED || path.length > (this.operator === 'void' ? 0 : 1);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.operator === 'delete') {
			this.argument.deoptimizePath(EMPTY_PATH);
			this.scope.context.requestTreeshakingPass();
		}
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		_options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		const literalValue = includeChildrenRecursively
			? UnknownValue
			: this.getLiteralValueAtPath(EMPTY_PATH, SHARED_RECURSION_TRACKER, this);
		if (typeof literalValue === 'symbol' || this.argument.shouldBeIncluded(context)) {
			this.argument.include(context, includeChildrenRecursively);
			this.literalValue = UnknownValue;
		} else {
			this.literalValue = literalValue;
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (typeof this.literalValue === 'symbol') {
			super.render(code, options);
		} else {
			code.overwrite(this.start, this.end, getRenderString(this.literalValue));
		}
	}
}

function getRenderString(value: unknown) {
	if (value === undefined) {
		return 'void 0';
	}
	if (typeof value === 'string') {
		return JSON.stringify(value);
	}
	if (typeof value === 'number') {
		return simplifyNumber(value);
	}
	return String(value);
}

function simplifyNumber(value: number) {
	if (Object.is(-0, value)) {
		return '-0';
	}
	if ((Math.abs(value) > 1000 && value % 1000 === 0) || (value !== 0 && Math.abs(value) < 0.01)) {
		const exp = value.toExponential();
		const [base, exponent] = exp.split('e');
		const floatLength = base.split('.')[1]?.length || 0;
		return `${base.replace('.', '')}e${parseInt(exponent) - floatLength}`;
	}
	return String(value).replace('+', '');
}
