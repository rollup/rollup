import Node from '../../Node';
import Scope from '../../scopes/Scope';
import CallOptions from '../../CallOptions';
import ExecutionPathOptions from '../../ExecutionPathOptions';
import Identifier from '../Identifier';

export default class ClassNode extends Node {
	body: Node;
	superClass: Node;
	id: Identifier;

	hasEffectsWhenAccessedAtPath (path: string[], _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: string[], _options: ExecutionPathOptions) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			this.body.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
			(this.superClass &&
				this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, options))
		);
	}

	initialiseChildren (scope: Scope) {
		if (this.superClass) {
			this.superClass.initialise(this.scope);
		}
		this.body.initialise(this.scope);
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new Scope({ parent: parentScope });
	}
}
