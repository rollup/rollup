import Node from '../Node';
import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';

export default class ObjectPattern extends Node {
	type: 'ObjectPattern';
	properties: AssignmentProperty[];

	reassignPath (path: string[], options) {
		path.length === 0 &&
			this.properties.forEach(child => child.reassignPath(path, options));
	}

	hasEffectsWhenAssignedAtPath (path: string[], options) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind, init) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}
