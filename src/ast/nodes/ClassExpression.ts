import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ClassExpression extends ClassNode {
	type: 'ClassExpression';

	initialiseChildren (parentScope: Scope) {
		this.id && this.id.initialiseAndDeclare(this.scope, 'class', this);
		super.initialiseChildren(parentScope);
	}

	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions): void {}
}
