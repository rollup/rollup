import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { ImmutableEntityPathTracker } from '../utils/ImmutableEntityPathTracker';
import { EMPTY_PATH, LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../values';
import Identifier from './Identifier';
import { LiteralValue } from './Literal';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

const unaryOperators: {
	[operator: string]: (value: LiteralValue) => LiteralValueOrUnknown;
} = {
	'!': value => !value,
	'+': value => +(value as NonNullable<LiteralValue>),
	'-': value => -(value as NonNullable<LiteralValue>),
	delete: () => UNKNOWN_VALUE,
	typeof: value => typeof value,
	void: () => undefined,
	'~': value => ~(value as NonNullable<LiteralValue>)
};

export default class UnaryExpression extends NodeBase {
	argument!: ExpressionNode;
	operator!: '!' | '+' | '-' | 'delete' | 'typeof' | 'void' | '~';
	prefix!: boolean;
	type!: NodeType.tUnaryExpression;

	bind() {
		super.bind();
		if (this.operator === 'delete') {
			this.argument.deoptimizePath(EMPTY_PATH);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length > 0) return UNKNOWN_VALUE;
		const argumentValue = this.argument.getLiteralValueAtPath(EMPTY_PATH, recursionTracker, origin);
		if (argumentValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		return unaryOperators[this.operator](argumentValue as LiteralValue);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		if (this.operator === 'typeof' && this.argument instanceof Identifier) return false;
		return (
			this.argument.hasEffects(options) ||
			(this.operator === 'delete' &&
				this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.operator === 'void') {
			return path.length > 0;
		}
		return path.length > 1;
	}
}
