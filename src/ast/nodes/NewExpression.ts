import Node from '../Node';
import CallOptions from '../CallOptions';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class NewExpression extends Node {
	type: 'NewExpression';
	callee: Expression;
	arguments: Expression[];

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

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions) {
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
