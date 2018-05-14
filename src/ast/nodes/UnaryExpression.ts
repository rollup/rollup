import { ObjectPath, LiteralValueOrUnknown, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { LiteralValue } from './Literal';

const unaryOperators: {
	[operator: string]: (value: LiteralValue) => LiteralValueOrUnknown;
} = {
	'-': value => -value,
	'+': value => +value,
	'!': value => !value,
	'~': value => ~value,
	typeof: value => typeof value,
	void: () => undefined,
	delete: () => UNKNOWN_VALUE
};

export default class UnaryExpression extends NodeBase {
	type: NodeType.tUnaryExpression;
	operator: keyof typeof unaryOperators;
	prefix: boolean;
	argument: ExpressionNode;

	bind() {
		super.bind();
		if (this.operator === 'delete') {
			this.argument.reassignPath([], ExecutionPathOptions.create());
		}
	}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path.length > 0) return UNKNOWN_VALUE;
		const argumentValue = this.argument.getLiteralValueAtPath([]);
		if (argumentValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		return unaryOperators[this.operator](<LiteralValue>argumentValue);
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			(this.operator === 'delete' && this.argument.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.operator === 'void') {
			return path.length > 0;
		}
		return path.length > 1;
	}
}
