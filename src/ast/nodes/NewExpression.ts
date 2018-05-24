import CallOptions from '../CallOptions';
import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import { ExpressionNode, NodeBase } from './shared/Node';
import * as NodeType from './NodeType';
import { ObjectPath, UNKNOWN_PATH } from '../values';

export default class NewExpression extends NodeBase {
	type: NodeType.tNewExpression;
	callee: ExpressionNode;
	arguments: ExpressionNode[];

	private callOptions: CallOptions;

	bind() {
		super.bind();
		for (const argument of this.arguments) {
			// This will make sure all properties of parameters behave as "unknown"
			argument.reassignPath(UNKNOWN_PATH, NEW_EXECUTION_PATH);
		}
	}

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
