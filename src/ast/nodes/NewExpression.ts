import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { ExpressionBase, ExpressionNode } from './shared/Expression';

export default class NewExpression extends ExpressionBase {
	type: 'NewExpression';
	callee: ExpressionNode;
	arguments: ExpressionNode[];

	_callOptions: CallOptions;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.arguments.some(child => child.hasEffects(options)) ||
			this.callee.hasEffectsWhenCalledAtPath(
				[],
				this._callOptions,
				options.getHasEffectsWhenCalledOptions()
			)
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	initialiseNode () {
		this._callOptions = CallOptions.create({
			withNew: true,
			args: this.arguments,
			caller: this
		});
	}
}
