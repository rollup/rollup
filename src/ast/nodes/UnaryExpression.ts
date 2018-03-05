import { ObjectPath, UNKNOWN_VALUE } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

const operators: {
	[operator: string]: (value: any) => any;
} = {
	'-': (value: any) => -value,
	'+': (value: any) => +value,
	'!': (value: any) => !value,
	'~': (value: any) => ~value,
	typeof: (value: any) => typeof value,
	void: (): any => undefined,
	delete: () => UNKNOWN_VALUE
};

export default class UnaryExpression extends NodeBase {
	type: NodeType.UnaryExpression;
	operator: '-' | '+' | '!' | '~' | 'typeof' | 'void' | 'delete';
	prefix: boolean;
	argument: ExpressionNode;

	value: any;

	bindNode () {
		if (this.operator === 'delete') {
			this.argument.reassignPath([], ExecutionPathOptions.create());
		}
	}

	getValue (): any {
		const argumentValue: any = this.argument.getValue();
		if (argumentValue === UNKNOWN_VALUE) return UNKNOWN_VALUE;

		return operators[this.operator](argumentValue);
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			(this.operator === 'delete' &&
			 this.argument.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		if (this.operator === 'void') {
			return path.length > 0;
		}
		return path.length > 1;
	}

	initialiseNode () {
		this.value = this.getValue();
	}
}
