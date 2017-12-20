import Node from '../Node';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';

export default class UpdateExpression extends Node {
	type: 'UpdateExpression';
	operator: '++' | '--' | '**';
	argument: Expression;
	prefix: boolean;

	bindNode () {
		disallowIllegalReassignment(this.scope, this.argument);
		this.argument.reassignPath([], ExecutionPathOptions.create());
		if (this.argument.type === 'Identifier') {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
