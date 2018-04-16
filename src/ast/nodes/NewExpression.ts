import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode, NodeBase } from './shared/Node';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';

export default class NewExpression extends NodeBase {
	type: NodeType.NewExpression;
	callee: ExpressionNode;
	arguments: ExpressionNode[];

	private callOptions: CallOptions;

	hasEffects(options: ExecutionPathOptions): boolean {
		for (const argument of this.arguments) {
			if (argument.hasEffects(options)) return true;
		}
		return this.callee.hasEffectsWhenCalledAtPath(
			[],
			this.callOptions,
			options.getHasEffectsWhenCalledOptions()
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	initialise() {
		this.included = false;
		this.callOptions = CallOptions.create({
			withNew: true,
			args: this.arguments,
			callIdentifier: this
		});
	}
}
