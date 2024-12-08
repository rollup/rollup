import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ACCESSED, NODE_INTERACTION_UNKNOWN_ASSIGNMENT } from '../NodeInteractions';
import { EMPTY_PATH, type EntityPathTracker, type ObjectPath } from '../utils/PathTracker';
import Identifier from './Identifier';
import type { LiteralValue } from './Literal';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
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

	get prefix(): boolean {
		return isFlagSet(this.flags, Flag.prefix);
	}
	set prefix(value: boolean) {
		this.flags = setFlag(this.flags, Flag.prefix, value);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
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
}
