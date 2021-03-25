import { CallOptions } from '../../CallOptions';
import { HasEffectsContext } from '../../ExecutionContext';
import ChildScope from '../../scopes/ChildScope';
import Scope from '../../scopes/Scope';
import { EMPTY_PATH, ObjectPath } from '../../utils/PathTracker';
import ClassBody from '../ClassBody';
import Identifier from '../Identifier';
import MethodDefinition from '../MethodDefinition';
import { ExpressionNode, NodeBase } from './Node';

export default class ClassNode extends NodeBase {
	body!: ClassBody;
	id!: Identifier | null;
	superClass!: ExpressionNode | null;
	private classConstructor!: MethodDefinition | null;

	createScope(parentScope: Scope) {
		this.scope = new ChildScope(parentScope);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		if (path.length <= 1) return false;
		return path.length > 2 || path[0] !== 'prototype';
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		if (path.length <= 1) return false;
		return path.length > 2 || path[0] !== 'prototype';
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	) {
		return !callOptions.withNew ||
			path.length > 0 ||
			(this.classConstructor !== null &&
				this.classConstructor.hasEffectsWhenCalledAtPath(EMPTY_PATH, callOptions, context)) ||
			(this.superClass !== null &&
				this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, context));
	}

	initialise() {
		if (this.id !== null) {
			this.id.declare('class', this);
		}
		for (const method of this.body.body) {
			if (method instanceof MethodDefinition && method.kind === 'constructor') {
				this.classConstructor = method;
				return;
			}
		}
		this.classConstructor = null;
	}
}
